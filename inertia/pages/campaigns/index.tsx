import { Link } from '@adonisjs/inertia/react'
import { Plus, Send } from 'lucide-react'
import Page from '~/components/page'
import AppLayout from '~/layouts/app'
import EmptyState from '~/components/empty_state'
import StatusBadge from '~/components/status_badge'
import WorkerAlert from '~/components/worker_alert'
import { type Data } from '@generated/data'
import { type InertiaProps } from '~/types'
import type { CampaignStats, WorkerHealth } from '~/lib/server_types'
import { formatDateTime, formatNumber, formatPercent } from '~/lib/format'

type Campaign = Data.Campaign.Variants['summary']

type Props = InertiaProps<{
  campaigns: Campaign[]
  stats: Record<string, CampaignStats>
  status: string
  worker: WorkerHealth
}>

const FILTERS = [
  { value: '', label: 'Toutes' },
  { value: 'draft', label: 'Brouillons' },
  { value: 'active', label: 'En cours et programmées' },
  { value: 'sent', label: 'Envoyées' },
]

function dateLine(campaign: Campaign) {
  switch (campaign.status) {
    case 'draft':
      return `Modifiée le ${formatDateTime(campaign.updatedAt)}`
    case 'scheduled':
      return `Prévue le ${formatDateTime(campaign.scheduledAt)}`
    case 'sent':
      return `Envoyée le ${formatDateTime(campaign.startedAt)}`
    case 'cancelled':
      return `Annulée le ${formatDateTime(campaign.finishedAt)}`
    default:
      return `Commencée le ${formatDateTime(campaign.startedAt)}`
  }
}

export default function CampaignsIndex({ campaigns, stats, status, worker }: Props) {
  return (
    <Page
      title="Campagnes"
      actions={
        <Link route="campaigns.create" className="btn btn--primary">
          <Plus size={16} /> Nouvelle campagne
        </Link>
      }
    >
      <WorkerAlert
        worker={worker}
        hasPendingEmails={campaigns.some((campaign) => campaign.status === 'sending')}
      />

      <div className="toolbar">
        <div className="tabs" role="tablist" aria-label="Filtrer les campagnes">
          {FILTERS.map((filter) => (
            <Link
              key={filter.value}
              route="campaigns.index"
              qs={filter.value ? { status: filter.value } : {}}
              className="tabs__tab"
              role="tab"
              aria-selected={status === filter.value}
              preserveScroll
            >
              {filter.label}
            </Link>
          ))}
        </div>
      </div>

      {campaigns.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={Send}
            title={status ? 'Aucune campagne ici' : 'Aucune campagne pour le moment'}
            action={
              <Link route="campaigns.create" className="btn btn--primary">
                Écrire une campagne
              </Link>
            }
          >
            Une campagne, c’est un email envoyé à une ou plusieurs listes de contacts.
          </EmptyState>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Campagne</th>
                <th>Statut</th>
                <th>Destinataires</th>
                <th className="num">Envoyés</th>
                <th className="num">Ouverture</th>
                <th className="num">Clic</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => {
                const campaignStats = stats[campaign.id]
                const isDraft = campaign.status === 'draft'
                return (
                  <tr key={campaign.id}>
                    <td style={{ maxWidth: 380 }}>
                      <Link
                        route={isDraft ? 'campaigns.edit' : 'campaigns.show'}
                        routeParams={{ id: campaign.id }}
                        className="cell-title"
                      >
                        {campaign.name}
                      </Link>
                      <span className="cell-sub truncate">{dateLine(campaign)}</span>
                    </td>
                    <td>
                      <StatusBadge kind="campaign" status={campaign.status} />
                    </td>
                    <td>
                      <div className="tag-list">
                        {(campaign.lists ?? []).map((list) => (
                          <span key={list.id} className="chip">
                            {list.name}
                          </span>
                        ))}
                        {(campaign.lists ?? []).length === 0 && <span className="muted">—</span>}
                      </div>
                    </td>
                    <td className="num">
                      {isDraft ? (
                        <span className="muted">—</span>
                      ) : (
                        <>
                          {formatNumber(campaignStats?.sent ?? 0)}
                          <span className="muted"> / {formatNumber(campaign.recipientsCount)}</span>
                        </>
                      )}
                    </td>
                    <td className="num">
                      {isDraft ? (
                        <span className="muted">—</span>
                      ) : (
                        formatPercent(campaignStats?.openRate ?? 0)
                      )}
                    </td>
                    <td className="num">
                      {isDraft ? (
                        <span className="muted">—</span>
                      ) : (
                        formatPercent(campaignStats?.clickRate ?? 0)
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Page>
  )
}

CampaignsIndex.layout = [AppLayout]
