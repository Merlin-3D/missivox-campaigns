import type { ApplicationService } from '@adonisjs/core/types'
import type CampaignWorker from '#services/campaign_worker'

/**
 * Runs the sending worker inside the web server, unless CAMPAIGN_WORKER
 * is false (the worker then runs with "node ace campaigns:work").
 */
export default class CampaignWorkerProvider {
  #worker: CampaignWorker | null = null

  constructor(protected app: ApplicationService) {}

  async ready() {
    const { default: env } = await import('#start/env')
    if (!env.get('CAMPAIGN_WORKER', true)) return

    const { default: Worker } = await import('#services/campaign_worker')
    this.#worker = new Worker()
    this.#worker.start()
  }

  async shutdown() {
    await this.#worker?.stop()
  }
}
