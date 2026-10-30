import Page from '~/components/page'
import AppLayout from '~/layouts/app'
import { Plus, Send, UserPlus } from 'lucide-react'
import { Link } from '@adonisjs/inertia/react'
import BarChart from '~/components/bar_chart'
import EmptyState from '~/components/empty_state'
import StatusBadge from '~/components/status_badge'
import WorkerAlert from '~/components/worker_alert'
import { type Data } from '@generated/data'
import { type InertiaProps } from '~/types'
import type { CampaignStats, WorkerHealth } from '~/lib/server_types'
import { formatDate, formatDateTime, formatNumber, formatPercent, plural } from '~/lib/format'

type Props = InertiaProps<{
  overview: {
    contacts: {
      total: number
      subscribed: number
      unsubscribed: number
      bounced: number
      newLast30Days: number
    }
    last30Days: { sent: number; openRate: number; clickRate: number }
    sentPerDay: { day: string; sent: number }[]
  }
  recentCampaigns: Data.Campaign.Variants['summary'][]
  recentStats: Record<string, CampaignStats>
  draftsCount: number
  activeCount: number
  worker: WorkerHealth
}>

function greeting() {
  const hour = new Date().getHours()
  return hour < 18 ? 'Bonjour' : 'Bonsoir'
}

export default function Dashboard({
  user,
  overview,
  recentCampaigns,
  recentStats,
  draftsCount,
  activeCount,
  worker,
}: Props) {
  const firstName = user?.fullName?.split(' ')[0]
  const { contacts, last30Days, sentPerDay } = overview
  const isNew = contacts.total === 0 && recentCampaigns.length === 0

  const summary = [
    activeCount > 0 && plural(activeCount, 'campagne en cours', 'campagnes en cours'),
    draftsCount > 0 && plural(draftsCount, 'brouillon'),
  ].filter(Boolean)

  return (
    <Page
      title={firstName ? `${greeting()} ${firstName}` : greeting()}
      description={
        summary.length > 0
          ? `Vous avez ${summary.join(' et ')}.`
          : 'Rien en attente. Une nouvelle campagne ?'
      }
      actions={
        <Link route="campaigns.create" className="btn btn--primary">
          <Plus size={16} /> Nouvelle campagne
        </Link>
      }
    >
      <WorkerAlert worker={worker} hasPendingEmails={activeCount > 0} />

      {isNew ? (
        <div className="panel">
          <EmptyState
            icon={UserPlus}
            title="Commencez par vos contacts"
            action={
              <div className="row" style={{ justifyContent: 'center' }}>
                <Link route="contact_imports.create" className="btn btn--primary">
                  Importer un fichier CSV
                </Link>
                <Link route="contacts.create" className="btn btn--secondary">
                  Ajouter un contact
                </Link>
              </div>
            }
          >
            Importez la liste de vos clients depuis un tableur, rangez-les dans des listes, puis
            écrivez votre première campagne.
          </EmptyState>
        </div>
      ) : (
        <div className="stack" style={{ gap: 20 }}>
          <section className="figures" aria-label="Chiffres des 30 derniers jours">
            <div className="figure">
              <div className="figure__label">Contacts inscrits</div>
              <div className="figure__value">{formatNumber(contacts.subscribed)}</div>
              <div className="figure__detail">
                {contacts.newLast30Days > 0
                  ? `+${formatNumber(contacts.newLast30Days)} ce mois-ci`
                  : `sur ${formatNumber(contacts.total)} au total`}
              </div>
            </div>
            <div className="figure">
              <div className="figure__label">Emails envoyés en 30 jours</div>
              <div className="figure__value">{formatNumber(last30Days.sent)}</div>
            </div>
            <div className="figure">
              <div className="figure__label">Taux d’ouverture</div>
              <div className="figure__value">{formatPercent(last30Days.openRate)}</div>
              <div className="figure__meter">
                <span style={{ width: `${Math.min(100, last30Days.openRate)}%` }} />
              </div>
            </div>
            <div className="figure">
              <div className="figure__label">Taux de clic</div>
              <div className="figure__value">{formatPercent(last30Days.clickRate)}</div>
              <div className="figure__meter">
                <span style={{ width: `${Math.min(100, last30Days.clickRate)}%` }} />
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel__header">
              <div>
                <h2 className="panel__title">Envois des 30 derniers jours</h2>
                <p className="panel__description">Nombre d’emails partis chaque jour.</p>
              </div>
            </div>
            <BarChart
              label="Emails envoyés"
              points={sentPerDay.map((point) => ({
                key: point.day,
                value: point.sent,
                title: `${formatDate(point.day)} : ${plural(point.sent, 'email')}`,
              }))}
              axis={[formatDate(sentPerDay[0]?.day), "Aujourd'hui"]}
            />
          </section>

          <section>
            <div className="row row--between" style={{ marginBottom: 12 }}>
              <h2 className="panel__title">Dernières campagnes</h2>
              <Link route="campaigns.index" className="il" style={{ fontSize: 14 }}>
                Toutes les campagnes
              </Link>
            </div>
            {recentCampaigns.length === 0 ? (
              <div className="panel">
                <EmptyState icon={Send} title="Aucune campagne envoyée">
                  Vos campagnes apparaîtront ici dès leur envoi, avec leurs ouvertures et leurs
                  clics.
                </EmptyState>
              </div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Campagne</th>
                      <th>Statut</th>
                      <th className="num">Envoyés</th>
                      <th className="num">Ouverture</th>
                      <th className="num">Clic</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCampaigns.map((campaign) => {
                      const stats = recentStats[campaign.id]
                      return (
                        <tr key={campaign.id}>
                          <td>
                            <Link
                              route="campaigns.show"
                              routeParams={{ id: campaign.id }}
                              className="cell-title"
                            >
                              {campaign.name}
                            </Link>
                            <span className="cell-sub">
                              {campaign.status === 'scheduled'
                                ? `Prévue le ${formatDateTime(campaign.scheduledAt)}`
                                : `Envoyée le ${formatDateTime(campaign.startedAt)}`}
                            </span>
                          </td>
                          <td>
                            <StatusBadge kind="campaign" status={campaign.status} />
                          </td>
                          <td className="num">
                            {formatNumber(stats?.sent ?? 0)}
                            <span className="muted">
                              {' '}
                              / {formatNumber(campaign.recipientsCount)}
                            </span>
                          </td>
                          <td className="num">{formatPercent(stats?.openRate ?? 0)}</td>
                          <td className="num">{formatPercent(stats?.clickRate ?? 0)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </Page>
  )
}

Dashboard.layout = [AppLayout]
