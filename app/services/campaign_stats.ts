import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { sqlDate } from '#services/sql_date'

export type CampaignStats = {
  recipients: number
  sent: number
  failed: number
  pending: number
  skipped: number
  opened: number
  opens: number
  clicked: number
  clicks: number
  unsubscribed: number
  openRate: number
  clickRate: number
  clickToOpenRate: number
}

function rate(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 1000) / 10 : 0
}

function emptyStats(): CampaignStats {
  return {
    recipients: 0,
    sent: 0,
    failed: 0,
    pending: 0,
    skipped: 0,
    opened: 0,
    opens: 0,
    clicked: 0,
    clicks: 0,
    unsubscribed: 0,
    openRate: 0,
    clickRate: 0,
    clickToOpenRate: 0,
  }
}

function withRates(stats: Omit<CampaignStats, 'openRate' | 'clickRate' | 'clickToOpenRate'>) {
  return {
    ...stats,
    openRate: rate(stats.opened, stats.sent),
    clickRate: rate(stats.clicked, stats.sent),
    clickToOpenRate: rate(stats.clicked, stats.opened),
  }
}

function campaignsOf(workspaceId: number) {
  return db.from('campaigns').where('workspace_id', workspaceId).select('id')
}

export default class CampaignStatsService {
  /**
   * Delivery and engagement counters of several campaigns, in one query.
   */
  static async forCampaigns(campaignIds: number[]) {
    const stats = new Map<number, CampaignStats>()
    campaignIds.forEach((id) => stats.set(id, emptyStats()))
    if (campaignIds.length === 0) return stats

    const rows = await db
      .from('campaign_recipients')
      .whereIn('campaign_id', campaignIds)
      .groupBy('campaign_id')
      .select('campaign_id')
      .select(
        db.raw(`COUNT(*) AS recipients,
          SUM(status = 'sent') AS sent,
          SUM(status = 'failed') AS failed,
          SUM(status IN ('pending', 'processing')) AS pending,
          SUM(status = 'skipped') AS skipped,
          SUM(opened_at IS NOT NULL) AS opened,
          SUM(open_count) AS opens,
          SUM(clicked_at IS NOT NULL) AS clicked,
          SUM(click_count) AS clicks,
          SUM(unsubscribed_at IS NOT NULL) AS unsubscribed`)
      )

    for (const row of rows) {
      stats.set(
        row.campaign_id,
        withRates({
          recipients: Number(row.recipients),
          sent: Number(row.sent),
          failed: Number(row.failed),
          pending: Number(row.pending),
          skipped: Number(row.skipped),
          opened: Number(row.opened),
          opens: Number(row.opens),
          clicked: Number(row.clicked),
          clicks: Number(row.clicks),
          unsubscribed: Number(row.unsubscribed),
        })
      )
    }

    return stats
  }

  static async forCampaign(campaignId: number) {
    const stats = await this.forCampaigns([campaignId])
    return stats.get(campaignId)!
  }

  /**
   * Clicks per link, with the number of distinct recipients who clicked.
   */
  static async links(campaignId: number) {
    const rows = await db
      .from('campaign_links')
      .leftJoin('tracking_events', 'tracking_events.link_id', 'campaign_links.id')
      .where('campaign_links.campaign_id', campaignId)
      .groupBy('campaign_links.id')
      .orderBy('clicks', 'desc')
      .select('campaign_links.id', 'campaign_links.url')
      .select(
        db.raw(
          'COUNT(tracking_events.id) AS clicks, COUNT(DISTINCT tracking_events.recipient_id) AS clickers'
        )
      )

    return rows.map((row) => ({
      id: row.id as number,
      url: row.url as string,
      clicks: Number(row.clicks),
      clickers: Number(row.clickers),
    }))
  }

  /**
   * Opens and clicks per hour during the first two days of a campaign.
   */
  static async activity(campaignId: number, startedAt: DateTime | null) {
    if (!startedAt) return []

    const start = startedAt.startOf('hour')
    const end = start.plus({ hours: 48 })
    const rows = await db
      .from('tracking_events')
      .where('campaign_id', campaignId)
      .whereIn('type', ['open', 'click'])
      .where('created_at', '>=', sqlDate(start))
      .where('created_at', '<', sqlDate(end))
      .groupByRaw(`strftime('%Y-%m-%d %H', created_at), type`)
      .select(db.raw(`strftime('%Y-%m-%d %H', created_at) AS hour, type, COUNT(*) AS total`))

    const buckets: { at: string; opens: number; clicks: number }[] = []
    for (let cursor = start; cursor < end; cursor = cursor.plus({ hours: 1 })) {
      const key = cursor.toLocal().toFormat('yyyy-MM-dd HH')
      const opens = rows.find((row) => row.hour === key && row.type === 'open')
      const clicks = rows.find((row) => row.hour === key && row.type === 'click')
      buckets.push({
        at: cursor.toISO()!,
        opens: Number(opens?.total ?? 0),
        clicks: Number(clicks?.total ?? 0),
      })
    }
    return buckets
  }

  /**
   * Figures of the dashboard of a workspace.
   */
  static async overview(workspaceId: number) {
    const contacts = await db
      .from('contacts')
      .where('workspace_id', workspaceId)
      .select(
        db.raw(`COUNT(*) AS total,
          SUM(status = 'subscribed') AS subscribed,
          SUM(status = 'unsubscribed') AS unsubscribed,
          SUM(status = 'bounced') AS bounced`)
      )
      .first()

    const since = DateTime.now().minus({ days: 30 })
    const engagement = await db
      .from('campaign_recipients')
      .whereIn('campaign_id', campaignsOf(workspaceId))
      .where('status', 'sent')
      .where('sent_at', '>=', sqlDate(since))
      .select(
        db.raw(`COUNT(*) AS sent,
          SUM(opened_at IS NOT NULL) AS opened,
          SUM(clicked_at IS NOT NULL) AS clicked`)
      )
      .first()

    const newContacts = await db
      .from('contacts')
      .where('workspace_id', workspaceId)
      .where('created_at', '>=', sqlDate(since))
      .count('* as total')
      .first()

    const perDay = await db
      .from('campaign_recipients')
      .whereIn('campaign_id', campaignsOf(workspaceId))
      .where('status', 'sent')
      .where('sent_at', '>=', sqlDate(since.startOf('day')))
      .groupByRaw(`date(sent_at)`)
      .select(db.raw(`date(sent_at) AS day, COUNT(*) AS total`))

    const days: { day: string; sent: number }[] = []
    for (
      let cursor = since.startOf('day');
      cursor <= DateTime.now();
      cursor = cursor.plus({ days: 1 })
    ) {
      const key = cursor.toFormat('yyyy-MM-dd')
      days.push({ day: key, sent: Number(perDay.find((row) => row.day === key)?.total ?? 0) })
    }

    const sent = Number(engagement?.sent ?? 0)
    const opened = Number(engagement?.opened ?? 0)
    const clicked = Number(engagement?.clicked ?? 0)

    return {
      contacts: {
        total: Number(contacts?.total ?? 0),
        subscribed: Number(contacts?.subscribed ?? 0),
        unsubscribed: Number(contacts?.unsubscribed ?? 0),
        bounced: Number(contacts?.bounced ?? 0),
        newLast30Days: Number(newContacts?.total ?? 0),
      },
      last30Days: {
        sent,
        openRate: rate(opened, sent),
        clickRate: rate(clicked, sent),
      },
      sentPerDay: days,
    }
  }
}
