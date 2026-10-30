import logger from '@adonisjs/core/services/logger'
import CampaignSender from '#services/campaign_sender'
import CampaignDispatcher from '#services/campaign_dispatcher'
import WorkerStatus from '#services/worker_status'
import WorkspaceMailer from '#services/workspace_mailer'

const IDLE_DELAY_MS = 2_000
const UNAVAILABLE_DELAY_MS = 30_000
const ERROR_DELAY_MS = 5_000
const REFRESH_EVERY_MS = 5_000
const HEARTBEAT_EVERY_MS = 10_000
const RECOVER_EVERY_MS = 60_000

/**
 * Long-running loop that starts the scheduled campaigns and sends their
 * emails. It runs inside the web server or in its own process ("node ace
 * campaigns:work").
 *
 * Each workspace sends at its own rate through its own server: the loop
 * takes the next email of every workspace whose turn has come, so a large
 * campaign never holds back the other workspaces.
 */
export default class CampaignWorker {
  #sender = new CampaignSender()
  #running = false
  #loop: Promise<void> | null = null
  #wake: (() => void) | null = null
  #lastHeartbeat = 0
  #lastRecovery = 0
  #lastRefresh = 0
  /**
   * When each workspace may send its next email.
   */
  #nextSendAt = new Map<number, number>()
  /**
   * Workspaces whose last email went out. An error left by a previous run
   * is cleared by the first successful send of the workspace.
   */
  #healthy = new Set<number>()

  start() {
    if (this.#running) return
    this.#running = true
    this.#loop = this.#run()
    logger.info('campaign worker started')
  }

  async stop() {
    if (!this.#running) return
    this.#running = false
    this.#wake?.()
    await this.#loop
    logger.info('campaign worker stopped')
  }

  /**
   * Waits for the given delay, or less if the worker is stopped meanwhile.
   */
  #sleep(ms: number) {
    if (ms <= 0 || !this.#running) return Promise.resolve()
    return new Promise<void>((resolve) => {
      const timer = setTimeout(done, ms)
      this.#wake = done
      function done() {
        clearTimeout(timer)
        resolve()
      }
    })
  }

  async #housekeeping() {
    const now = Date.now()
    if (now - this.#lastRefresh >= REFRESH_EVERY_MS) {
      this.#sender.refresh()
      this.#lastRefresh = now
    }
    if (now - this.#lastHeartbeat >= HEARTBEAT_EVERY_MS) {
      await WorkerStatus.beat()
      this.#lastHeartbeat = now
    }
    if (now - this.#lastRecovery >= RECOVER_EVERY_MS) {
      await this.#sender.recoverStale()
      this.#lastRecovery = now
    }
    await CampaignDispatcher.startDue()
  }

  async #run() {
    while (this.#running) {
      try {
        await this.#housekeeping()

        const queue = await this.#sender.nextPerWorkspace()
        if (queue.length === 0) {
          await CampaignDispatcher.finishCompleted()
          await this.#sleep(IDLE_DELAY_MS)
          continue
        }

        for (const { workspaceId, recipientId } of queue) {
          if (!this.#running) break
          if ((this.#nextSendAt.get(workspaceId) ?? 0) > Date.now()) continue
          await this.#send(workspaceId, recipientId)
        }

        await CampaignDispatcher.finishCompleted()

        /**
         * Until the next workspace may send. The small floor keeps the loop
         * from spinning on emails another worker claimed first.
         */
        const nextTurn = Math.min(
          ...queue.map(({ workspaceId }) => this.#nextSendAt.get(workspaceId) ?? 0)
        )
        await this.#sleep(Math.max(10, Math.min(IDLE_DELAY_MS, nextTurn - Date.now())))
      } catch (error) {
        logger.error({ err: error }, 'campaign worker failed')
        await this.#sleep(ERROR_DELAY_MS)
      }
    }
  }

  async #send(workspaceId: number, recipientId: number) {
    const result = await this.#sender.deliver(recipientId)

    if (result === 'unavailable') {
      this.#healthy.delete(workspaceId)
      this.#nextSendAt.set(workspaceId, Date.now() + UNAVAILABLE_DELAY_MS)
      await WorkerStatus.reportError(
        workspaceId,
        (await WorkspaceMailer.canSend(workspaceId))
          ? 'Le serveur SMTP est injoignable ou refuse la connexion. Nouvel essai dans 30 secondes.'
          : "Aucun serveur d'envoi n'est configuré : renseignez votre serveur SMTP dans les réglages."
      )
      return
    }

    /**
     * The server answered, even to refuse a recipient: it counts in the
     * sending rate and proves the server works.
     */
    if (result === 'sent' || result === 'retry' || result === 'failed') {
      if (!this.#healthy.has(workspaceId)) {
        await WorkerStatus.clearError(workspaceId)
        this.#healthy.add(workspaceId)
      }
      const { sendRatePerMinute } = await this.#sender.settingsOf(workspaceId)
      this.#nextSendAt.set(workspaceId, Date.now() + 60_000 / Math.max(1, sendRatePerMinute))
    }
  }
}
