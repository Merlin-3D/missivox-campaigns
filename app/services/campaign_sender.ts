import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import logger from '@adonisjs/core/services/logger'
import Campaign from '#models/campaign'
import Contact from '#models/contact'
import CampaignLink from '#models/campaign_link'
import CampaignRecipient from '#models/campaign_recipient'
import PublicUrls from '#services/public_urls'
import { contactMergeData } from '#services/merge_tags'
import { sqlDate } from '#services/sql_date'
import CampaignDispatcher from '#services/campaign_dispatcher'
import { personalizeEmail, prepareEmail, type PreparedEmail } from '#services/email_renderer'
import WorkspaceMailer, { type WorkspaceMailerContract } from '#services/workspace_mailer'
import SettingsService, { type AppSettings } from '#services/settings_service'

/**
 * Delays before retrying a failed email: 1, 5 then 15 minutes.
 */
const RETRY_DELAYS_IN_MINUTES = [1, 5, 15]

/**
 * An email stuck in "processing" for longer than this was being sent by a
 * worker that stopped: it is queued again.
 */
const STALE_AFTER_MINUTES = 10

export type DeliveryResult = 'sent' | 'retry' | 'failed' | 'skipped' | 'unavailable'

type PreparedCampaign = {
  campaign: Campaign
  email: PreparedEmail
  links: Map<string, number> | null
  settings: AppSettings
}

/**
 * SMTP errors that mean the mail server itself is unreachable or refuses
 * us. They say nothing about the recipient, so they do not use up the
 * recipient's attempts.
 */
export function isTransportError(error: any) {
  return ['ECONNECTION', 'ETIMEDOUT', 'ESOCKET', 'EAUTH', 'EDNS', 'ECONNREFUSED', 'ETLS'].includes(
    error?.code
  )
}

/**
 * The recipient address was rejected for good (unknown mailbox, etc.).
 */
export function isHardBounce(error: any) {
  return error?.command === 'RCPT TO' && [550, 551, 553].includes(Number(error?.responseCode))
}

/**
 * Sends the queued emails, one recipient at a time.
 */
export default class CampaignSender {
  #prepared = new Map<number, PreparedCampaign>()
  #settings = new Map<number, AppSettings>()
  #mailers = new Map<number, WorkspaceMailerContract | null>()

  /**
   * Forgets what was loaded, so changes to settings and campaigns (a
   * paused campaign, a new company address, a new SMTP server) are picked
   * up.
   */
  refresh() {
    this.#prepared.clear()
    this.#settings.clear()
    this.#mailers.clear()
  }

  async settingsOf(workspaceId: number) {
    let settings = this.#settings.get(workspaceId)
    if (!settings) {
      settings = await SettingsService.all(workspaceId)
      this.#settings.set(workspaceId, settings)
    }
    return settings
  }

  async #mailerOf(workspaceId: number) {
    if (!this.#mailers.has(workspaceId)) {
      this.#mailers.set(workspaceId, await WorkspaceMailer.for(workspaceId))
    }
    return this.#mailers.get(workspaceId)!
  }

  async #prepare(campaignId: number): Promise<PreparedCampaign> {
    const cached = this.#prepared.get(campaignId)
    if (cached) return cached

    const campaign = await Campaign.findOrFail(campaignId)
    const settings = await this.settingsOf(campaign.workspaceId)
    const campaignLinks = campaign.trackClicks
      ? await CampaignLink.query().where('campaign_id', campaignId)
      : null
    const links = campaignLinks ? new Map(campaignLinks.map((link) => [link.url, link.id])) : null

    const prepared = { campaign, email: prepareEmail(campaign, settings), links, settings }
    this.#prepared.set(campaignId, prepared)
    return prepared
  }

  /**
   * Queues again the emails of a worker that stopped while sending.
   */
  async recoverStale() {
    await db
      .from('campaign_recipients')
      .where('status', 'processing')
      .where('updated_at', '<', sqlDate(DateTime.now().minus({ minutes: STALE_AFTER_MINUTES })))
      .update({ status: 'pending', updated_at: sqlDate() })
  }

  /**
   * Ids of the next emails to send, oldest campaigns first.
   */
  async nextBatch(limit: number): Promise<number[]> {
    const rows = await db
      .from('campaign_recipients')
      .join('campaigns', 'campaigns.id', 'campaign_recipients.campaign_id')
      .where('campaigns.status', 'sending')
      .where('campaign_recipients.status', 'pending')
      .where((query) => {
        query
          .whereNull('campaign_recipients.next_attempt_at')
          .orWhere('campaign_recipients.next_attempt_at', '<=', sqlDate())
      })
      .orderBy('campaign_recipients.id')
      .limit(limit)
      .select('campaign_recipients.id')

    return rows.map((row) => row.id)
  }

  /**
   * The next email to send of each workspace, so that a workspace sending
   * a large campaign does not hold back the others.
   */
  async nextPerWorkspace(): Promise<{ workspaceId: number; recipientId: number }[]> {
    const rows = await db
      .from('campaign_recipients')
      .join('campaigns', 'campaigns.id', 'campaign_recipients.campaign_id')
      .where('campaigns.status', 'sending')
      .where('campaign_recipients.status', 'pending')
      .where((query) => {
        query
          .whereNull('campaign_recipients.next_attempt_at')
          .orWhere('campaign_recipients.next_attempt_at', '<=', sqlDate())
      })
      .groupBy('campaigns.workspace_id')
      .select('campaigns.workspace_id')
      .min('campaign_recipients.id as recipient_id')

    return rows.map((row) => ({ workspaceId: row.workspace_id, recipientId: row.recipient_id }))
  }

  /**
   * Sends one email. The recipient is first claimed with a conditional
   * update, so two workers never send the same email.
   */
  async deliver(recipientId: number): Promise<DeliveryResult | null> {
    const claimed = await db
      .from('campaign_recipients')
      .where('id', recipientId)
      .where('status', 'pending')
      .update({ status: 'processing', updated_at: sqlDate() })

    if (Number(claimed) === 0) return null

    const recipient = await CampaignRecipient.findOrFail(recipientId)
    const contact = recipient.contactId ? await Contact.find(recipient.contactId) : null

    if (!contact || contact.status !== 'subscribed') {
      recipient.status = 'skipped'
      recipient.error = contact
        ? 'Contact désinscrit avant l’envoi'
        : 'Contact supprimé avant l’envoi'
      await recipient.save()
      return 'skipped'
    }

    const { campaign, email, links, settings } = await this.#prepare(recipient.campaignId)
    const mailer = await this.#mailerOf(campaign.workspaceId)

    if (!mailer) {
      return this.#postpone(recipient, "Aucun serveur d'envoi n'est configuré.")
    }

    const rendered = personalizeEmail(email, {
      data: contactMergeData(contact),
      unsubscribeUrl: PublicUrls.unsubscribe(recipient.token),
      webVersionUrl: PublicUrls.webVersion(recipient.token),
      tracking: {
        baseUrl: PublicUrls.base(),
        token: recipient.token,
        opens: campaign.trackOpens,
        links,
      },
    })

    try {
      await mailer.send((message) => {
        message
          .from(campaign.fromEmail, campaign.fromName)
          .to(recipient.email, contact.fullName ?? undefined)
          .subject(rendered.subject)
          .html(rendered.html)
          .text(rendered.text)
          .header('X-Campaign-Id', String(campaign.id))
          .listUnsubscribe(`<${PublicUrls.unsubscribe(recipient.token)}>`, { oneClick: true })

        const replyTo = campaign.replyTo || settings.replyTo
        if (replyTo) message.replyTo(replyTo)
      })
    } catch (error) {
      return this.#handleFailure(recipient, contact, error)
    }

    recipient.status = 'sent'
    recipient.sentAt = DateTime.now()
    recipient.attempts += 1
    recipient.error = null
    recipient.nextAttemptAt = null
    await recipient.save()
    return 'sent'
  }

  /**
   * The server could not be used: the email waits, without using up one of
   * the recipient's attempts.
   */
  async #postpone(recipient: CampaignRecipient, reason: string): Promise<DeliveryResult> {
    recipient.status = 'pending'
    recipient.nextAttemptAt = DateTime.now().plus({ minutes: 1 })
    recipient.error = reason
    await recipient.save()
    return 'unavailable'
  }

  async #handleFailure(
    recipient: CampaignRecipient,
    contact: Contact,
    error: any
  ): Promise<DeliveryResult> {
    const message = String(error?.response ?? error?.message ?? error).slice(0, 1000)

    if (isTransportError(error)) {
      return this.#postpone(recipient, message)
    }

    recipient.attempts += 1
    recipient.error = message

    if (isHardBounce(error)) {
      recipient.status = 'failed'
      contact.status = 'bounced'
      await contact.save()
    } else if (recipient.attempts <= RETRY_DELAYS_IN_MINUTES.length) {
      recipient.status = 'pending'
      recipient.nextAttemptAt = DateTime.now().plus({
        minutes: RETRY_DELAYS_IN_MINUTES[recipient.attempts - 1],
      })
    } else {
      recipient.status = 'failed'
    }

    await recipient.save()
    logger.warn({ recipientId: recipient.id, error: message }, 'campaign email failed')
    return recipient.status === 'failed' ? 'failed' : 'retry'
  }

  /**
   * Sends everything that is due, without throttling. Used by the tests and
   * handy to flush a queue from the REPL. Emails postponed because their
   * server is unavailable are not due anymore, so the loop ends.
   */
  async drain() {
    this.refresh()
    await CampaignDispatcher.startDue()
    const results: DeliveryResult[] = []

    let batch = await this.nextBatch(100)
    while (batch.length > 0) {
      for (const id of batch) {
        const result = await this.deliver(id)
        if (result) results.push(result)
      }
      batch = await this.nextBatch(100)
    }

    await CampaignDispatcher.finishCompleted()
    return results
  }
}
