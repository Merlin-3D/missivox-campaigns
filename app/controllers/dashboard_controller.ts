import Campaign from '#models/campaign'
import WorkerStatus from '#services/worker_status'
import CampaignStatsService from '#services/campaign_stats'
import CampaignTransformer from '#transformers/campaign_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class DashboardController {
  async index({ inertia, auth }: HttpContext) {
    const { workspaceId } = auth.user!
    const recent = await Campaign.ofWorkspace(workspaceId)
      .whereNot('status', 'draft')
      .orderByRaw('COALESCE(started_at, scheduled_at, created_at) DESC')
      .limit(5)
    const stats = await CampaignStatsService.forCampaigns(recent.map((campaign) => campaign.id))

    const drafts = await Campaign.ofWorkspace(workspaceId)
      .where('status', 'draft')
      .count('* as total')
      .first()
    const active = await Campaign.ofWorkspace(workspaceId)
      .whereIn('status', ['sending', 'paused', 'scheduled'])
      .count('* as total')
      .first()

    return inertia.render('dashboard', {
      overview: await CampaignStatsService.overview(workspaceId),
      recentCampaigns: CampaignTransformer.transform(recent).useVariant('summary'),
      recentStats: Object.fromEntries(stats),
      draftsCount: Number(drafts?.$extras.total ?? 0),
      activeCount: Number(active?.$extras.total ?? 0),
      worker: await WorkerStatus.get(workspaceId),
    })
  }
}
