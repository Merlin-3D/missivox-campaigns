import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Campaign from '#models/campaign'
import CampaignLink from '#models/campaign_link'
import { extractTrackableLinks } from '#services/email_links'
import { findUnknownTags } from '#services/merge_tags'
import { sqlDate } from '#services/sql_date'
import WorkspaceMailer from '#services/workspace_mailer'
import CampaignStateException from '#exceptions/campaign_state_exception'

export type ReadinessReport = {
  audience: number
  problems: string[]
  warnings: string[]
}

/**
 * Moves campaigns through their lifecycle:
 * draft → scheduled → sending ⇄ paused → sent, or cancelled.
 */
export default class CampaignDispatcher {
  /**
   * Number of distinct subscribed contacts in the given lists.
   */
  static async audienceSize(listIds: number[]) {
    if (listIds.length === 0) return 0

    const result = await db
      .from('contacts')
      .where('status', 'subscribed')
      .whereIn('id', db.from('contact_list').select('contact_id').whereIn('list_id', listIds))
      .count('* as total')
      .first()

    return Number(result?.total ?? 0)
  }

  /**
   * Checks that a campaign can be sent. Problems block the sending,
   * warnings only inform.
   */
  static async readiness(campaign: Campaign): Promise<ReadinessReport> {
    await campaign.load('lists')
    const listIds = campaign.lists.map((list) => list.id)
    const audience = await this.audienceSize(listIds)
    const problems: string[] = []
    const warnings: string[] = []

    if (listIds.length === 0) {
      problems.push('Choisissez au moins une liste de destinataires.')
    } else if (audience === 0) {
      problems.push('Les listes choisies ne contiennent aucun contact inscrit.')
    }
    if (!campaign.subject.trim()) {
      problems.push("L'objet de l'email est vide.")
    }
    if (!campaign.body.replace(/<[^>]*>/g, '').trim()) {
      problems.push("Le contenu de l'email est vide.")
    }
    if (!(await WorkspaceMailer.canSend(campaign.workspaceId))) {
      problems.push("Renseignez votre serveur d'envoi (SMTP) dans les réglages.")
    }

    const unknownTags = findUnknownTags(
      `${campaign.subject} ${campaign.preheader ?? ''} ${campaign.body}`
    )
    if (unknownTags.length > 0) {
      warnings.push(
        `Variables inconnues, elles seront remplacées par du vide : ${unknownTags.map((tag) => `{{ ${tag} }}`).join(', ')}.`
      )
    }
    if (!campaign.preheader) {
      warnings.push("Pas de texte d'aperçu : les messageries afficheront le début du contenu.")
    }

    return { audience, problems, warnings }
  }

  /**
   * Queues a draft, to be sent at the given date or right away.
   */
  static async schedule(campaign: Campaign, at: DateTime | null) {
    if (campaign.status !== 'draft') {
      throw new CampaignStateException('Seul un brouillon peut être programmé.')
    }

    const { problems } = await this.readiness(campaign)
    if (problems.length > 0) {
      throw new CampaignStateException(problems[0])
    }

    if (at && at <= DateTime.now()) {
      throw new CampaignStateException("La date d'envoi doit être dans le futur.")
    }

    campaign.status = 'scheduled'
    campaign.scheduledAt = at ?? DateTime.now()
    await campaign.save()

    if (!at) {
      await this.start(campaign)
    }
  }

  /**
   * Puts a scheduled campaign back to draft.
   */
  static async unschedule(campaign: Campaign) {
    if (campaign.status !== 'scheduled') {
      throw new CampaignStateException("Cette campagne n'est pas programmée.")
    }
    campaign.status = 'draft'
    campaign.scheduledAt = null
    await campaign.save()
  }

  /**
   * Snapshots the audience into the recipients table and starts sending.
   * Contacts added to the lists afterwards are not part of the campaign.
   */
  static async start(campaign: Campaign) {
    await db.transaction(async (trx) => {
      const now = sqlDate()

      /**
       * The status check makes the start idempotent when the web server
       * and the worker race for the same campaign.
       */
      const claimed = await trx
        .from('campaigns')
        .where('id', campaign.id)
        .where('status', 'scheduled')
        .update({ status: 'sending', started_at: now, updated_at: now })

      if (Number(claimed) === 0) return

      if (campaign.trackClicks) {
        const urls = extractTrackableLinks(campaign.body)
        if (urls.length > 0) {
          await CampaignLink.createMany(
            urls.map((url) => ({ campaignId: campaign.id, url })),
            { client: trx }
          )
        }
      }

      await trx.rawQuery(
        `INSERT INTO campaign_recipients
          (campaign_id, contact_id, email, token, status, attempts, open_count, click_count, created_at, updated_at)
        SELECT ?, contacts.id, contacts.email, lower(hex(randomblob(16))), 'pending', 0, 0, 0, ?, ?
        FROM contacts
        WHERE contacts.status = 'subscribed'
          AND contacts.id IN (
            SELECT contact_id FROM contact_list
            WHERE list_id IN (SELECT list_id FROM campaign_list WHERE campaign_id = ?)
          )
        ORDER BY contacts.id`,
        [campaign.id, now, now, campaign.id]
      )

      const total = await trx
        .from('campaign_recipients')
        .where('campaign_id', campaign.id)
        .count('* as total')
        .first()
      const recipientsCount = Number(total?.total ?? 0)

      await trx
        .from('campaigns')
        .where('id', campaign.id)
        .update(
          recipientsCount === 0
            ? { recipients_count: 0, status: 'sent', finished_at: now }
            : { recipients_count: recipientsCount }
        )
    })

    await campaign.refresh()
  }

  static async pause(campaign: Campaign) {
    if (campaign.status !== 'sending') {
      throw new CampaignStateException("Cette campagne n'est pas en cours d'envoi.")
    }
    campaign.status = 'paused'
    await campaign.save()
  }

  static async resume(campaign: Campaign) {
    if (campaign.status !== 'paused') {
      throw new CampaignStateException("Cette campagne n'est pas en pause.")
    }
    campaign.status = 'sending'
    await campaign.save()
  }

  /**
   * Stops a campaign for good. Emails already sent stay in the report, the
   * others are marked as skipped.
   */
  static async cancel(campaign: Campaign) {
    if (campaign.status !== 'sending' && campaign.status !== 'paused') {
      throw new CampaignStateException('Seul un envoi en cours ou en pause peut être annulé.')
    }

    await db.transaction(async (trx) => {
      campaign.useTransaction(trx)
      campaign.status = 'cancelled'
      campaign.finishedAt = DateTime.now()
      await campaign.save()

      await trx
        .from('campaign_recipients')
        .where('campaign_id', campaign.id)
        .whereIn('status', ['pending', 'processing'])
        .update({ status: 'skipped', error: 'Campagne annulée', updated_at: sqlDate() })
    })
  }

  /**
   * Marks as sent the campaigns that have no email left to send.
   */
  static async finishCompleted() {
    const now = sqlDate()
    await db
      .from('campaigns')
      .where('status', 'sending')
      .whereNotExists(
        db
          .from('campaign_recipients')
          .whereColumn('campaign_recipients.campaign_id', 'campaigns.id')
          .whereIn('campaign_recipients.status', ['pending', 'processing'])
      )
      .update({ status: 'sent', finished_at: now, updated_at: now })
  }

  /**
   * Starts the scheduled campaigns whose date has come.
   */
  static async startDue() {
    const due = await Campaign.query()
      .where('status', 'scheduled')
      .where('scheduled_at', '<=', sqlDate())
      .orderBy('scheduled_at')

    for (const campaign of due) {
      await this.start(campaign)
    }
  }

  /**
   * Duplicates a campaign as a new draft, keeping its content and lists.
   */
  static async duplicate(campaign: Campaign, userId: number) {
    await campaign.load('lists')

    const copy = await Campaign.create({
      workspaceId: campaign.workspaceId,
      name: `${campaign.name} (copie)`,
      subject: campaign.subject,
      preheader: campaign.preheader,
      fromName: campaign.fromName,
      fromEmail: campaign.fromEmail,
      replyTo: campaign.replyTo,
      editor: campaign.editor,
      body: campaign.body,
      trackOpens: campaign.trackOpens,
      trackClicks: campaign.trackClicks,
      status: 'draft',
      userId,
    })
    await copy.related('lists').attach(campaign.lists.map((list) => list.id))

    return copy
  }
}
