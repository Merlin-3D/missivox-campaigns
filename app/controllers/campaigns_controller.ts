import db from '@adonisjs/lucid/services/db'
import Campaign from '#models/campaign'
import List from '#models/list'
import Template from '#models/template'
import CampaignRecipient from '#models/campaign_recipient'
import WorkerStatus from '#services/worker_status'
import SettingsService from '#services/settings_service'
import CampaignDispatcher from '#services/campaign_dispatcher'
import CampaignStatsService from '#services/campaign_stats'
import { STARTER_BODY } from '#services/starter_content'
import { CAMPAIGN_STATUSES } from '#database/enums'
import CampaignStateException from '#exceptions/campaign_state_exception'
import CampaignTransformer from '#transformers/campaign_transformer'
import ListTransformer from '#transformers/list_transformer'
import RecipientTransformer from '#transformers/recipient_transformer'
import TemplateTransformer from '#transformers/template_transformer'
import {
  createCampaignValidator,
  recipientFiltersValidator,
  updateCampaignValidator,
} from '#validators/campaign'
import type { HttpContext } from '@adonisjs/core/http'

const RECIPIENTS_PER_PAGE = 50

async function listsWithCounts(workspaceId: number) {
  return List.ofWorkspace(workspaceId)
    .withCount('contacts', (query) => query.where('status', 'subscribed').as('subscribed_count'))
    .withCount('contacts')
    .orderBy('name')
}

export default class CampaignsController {
  async index({ request, inertia, auth }: HttpContext) {
    const { workspaceId } = auth.user!
    const status = request.qs().status
    const query = Campaign.ofWorkspace(workspaceId).preload('lists').orderBy('updated_at', 'desc')

    if (status === 'active') {
      query.whereIn('status', ['scheduled', 'sending', 'paused'])
    } else if (CAMPAIGN_STATUSES.includes(status)) {
      query.where('status', status)
    }

    const campaigns = await query
    const stats = await CampaignStatsService.forCampaigns(campaigns.map((campaign) => campaign.id))

    return inertia.render('campaigns/index', {
      campaigns: CampaignTransformer.transform(campaigns).useVariant('summary'),
      stats: Object.fromEntries(stats),
      status: typeof status === 'string' ? status : '',
      worker: await WorkerStatus.get(workspaceId),
    })
  }

  async create({ inertia, auth }: HttpContext) {
    const { workspaceId } = auth.user!
    const settings = await SettingsService.all(workspaceId)
    const templates = await Template.ofWorkspace(workspaceId).orderBy('name')

    return inertia.render('campaigns/create', {
      lists: ListTransformer.transform(await listsWithCounts(workspaceId)).useVariant('withCounts'),
      templates: TemplateTransformer.transform(templates).useVariant('summary'),
      defaults: {
        fromName: settings.senderName,
        fromEmail: settings.senderEmail,
        replyTo: settings.replyTo,
      },
    })
  }

  async store({ request, response, auth }: HttpContext) {
    const { workspaceId } = auth.user!
    const { templateId, listIds, subject, ...data } =
      await request.validateUsing(createCampaignValidator)
    const template = templateId
      ? await Template.ofWorkspace(workspaceId).where('id', templateId).first()
      : null
    const ownListIds = await List.ownedIds(workspaceId, listIds)

    const campaign = await db.transaction(async (trx) => {
      const created = await Campaign.create(
        {
          ...data,
          workspaceId,
          subject: subject || template?.subject || '',
          editor: template?.editor ?? 'visual',
          body: template?.body ?? STARTER_BODY,
          status: 'draft',
          trackOpens: true,
          trackClicks: true,
          userId: auth.user!.id,
        },
        { client: trx }
      )
      if (ownListIds.length) await created.related('lists').attach(ownListIds)
      return created
    })

    return response.redirect().toRoute('campaigns.edit', { id: campaign.id })
  }

  /**
   * The editor. Campaigns that left the draft state open their report.
   */
  async edit({ params, inertia, response, auth }: HttpContext) {
    const { workspaceId } = auth.user!
    const campaign = await Campaign.ofWorkspace(workspaceId)
      .where('id', params.id)
      .preload('lists')
      .firstOrFail()
    if (!campaign.isEditable) {
      return response.redirect().toRoute('campaigns.show', { id: campaign.id })
    }

    return inertia.render('campaigns/edit', {
      campaign: CampaignTransformer.transform(campaign),
      lists: ListTransformer.transform(await listsWithCounts(workspaceId)).useVariant('withCounts'),
      readiness: await CampaignDispatcher.readiness(campaign),
    })
  }

  async update({ params, request, response, session, auth }: HttpContext) {
    const { workspaceId } = auth.user!
    const campaign = await Campaign.findOwnedOrFail(workspaceId, params.id)
    if (!campaign.isEditable) {
      throw new CampaignStateException(
        'Cette campagne ne peut plus être modifiée. Repassez-la en brouillon pour la changer.'
      )
    }

    const { listIds, body, ...data } = await request.validateUsing(updateCampaignValidator)
    const ownListIds = await List.ownedIds(workspaceId, listIds)

    await db.transaction(async (trx) => {
      campaign.useTransaction(trx)
      campaign.merge({ ...data, body: body ?? '' })
      await campaign.save()
      await campaign.related('lists').sync(ownListIds)
    })

    session.flash('success', 'Campagne enregistrée.')
    return response.redirect().back()
  }

  /**
   * The report of a campaign that was queued or sent.
   */
  async show({ params, request, inertia, response, auth }: HttpContext) {
    const { workspaceId } = auth.user!
    const campaign = await Campaign.ofWorkspace(workspaceId)
      .where('id', params.id)
      .preload('lists')
      .firstOrFail()
    if (campaign.isEditable) {
      return response.redirect().toRoute('campaigns.edit', { id: campaign.id })
    }

    const filters = await request.validateUsing(recipientFiltersValidator, { data: request.qs() })
    const recipients = CampaignRecipient.query().where('campaign_id', campaign.id).orderBy('id')

    switch (filters.status) {
      case 'opened':
        recipients.whereNotNull('opened_at')
        break
      case 'clicked':
        recipients.whereNotNull('clicked_at')
        break
      case 'unsubscribed':
        recipients.whereNotNull('unsubscribed_at')
        break
      case 'pending':
        recipients.whereIn('status', ['pending', 'processing'])
        break
      case 'sent':
      case 'failed':
      case 'skipped':
        recipients.where('status', filters.status)
        break
    }
    if (filters.q) {
      recipients.whereRaw('lower(email) LIKE ?', [`%${filters.q.toLowerCase()}%`])
    }

    const paginator = await recipients.paginate(filters.page ?? 1, RECIPIENTS_PER_PAGE)

    return inertia.render('campaigns/show', {
      campaign: CampaignTransformer.transform(campaign),
      stats: await CampaignStatsService.forCampaign(campaign.id),
      links: await CampaignStatsService.links(campaign.id),
      activity: await CampaignStatsService.activity(campaign.id, campaign.startedAt),
      recipients: RecipientTransformer.transform(paginator.all()),
      recipientsMeta: {
        total: paginator.total,
        currentPage: paginator.currentPage,
        lastPage: paginator.lastPage,
      },
      filters: { status: filters.status ?? '', q: filters.q ?? '' },
      worker: await WorkerStatus.get(workspaceId),
    })
  }

  async duplicate({ params, response, session, auth }: HttpContext) {
    const campaign = await Campaign.findOwnedOrFail(auth.user!.workspaceId, params.id)
    const copy = await CampaignDispatcher.duplicate(campaign, auth.user!.id)

    session.flash('success', 'La campagne a été dupliquée.')
    return response.redirect().toRoute('campaigns.edit', { id: copy.id })
  }

  async destroy({ params, response, session, auth }: HttpContext) {
    const campaign = await Campaign.findOwnedOrFail(auth.user!.workspaceId, params.id)
    if (!campaign.isDeletable) {
      throw new CampaignStateException(
        "Une campagne envoyée ou en cours d'envoi ne peut pas être supprimée."
      )
    }
    await campaign.delete()

    session.flash('success', `La campagne « ${campaign.name} » a été supprimée.`)
    return response.redirect().toRoute('campaigns.index')
  }
}
