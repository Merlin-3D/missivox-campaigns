import { useEffect, useRef, useState } from 'react'
import { router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { CalendarClock, Copy, Eye, Pause, Play, Search, Trash2, Undo2, X } from 'lucide-react'
import Page from '~/components/page'
import AppLayout from '~/layouts/app'
import { urlFor } from '~/client'
import Postmark from '~/components/postmark'
import BarChart from '~/components/bar_chart'
import Pagination from '~/components/pagination'
import StatusBadge from '~/components/status_badge'
import WorkerAlert from '~/components/worker_alert'
import ConfirmAction from '~/components/confirm_action'
import { type Data } from '@generated/data'
import { type InertiaProps } from '~/types'
import type { CampaignStats, WorkerHealth } from '~/lib/server_types'
import {
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatRelative,
  formatTime,
  plural,
} from '~/lib/format'

type Props = InertiaProps<{
  campaign: Data.Campaign
  stats: CampaignStats
  links: { id: number; url: string; clicks: number; clickers: number }[]
  activity: { at: string; opens: number; clicks: number }[]
  recipients: Data.Recipient[]
  recipientsMeta: { total: number; currentPage: number; lastPage: number }
  filters: { status: string; q: string }
  worker: WorkerHealth
}>

const RECIPIENT_FILTERS = [
  { value: '', label: 'Tous' },
  { value: 'opened', label: 'Ont ouvert' },
  { value: 'clicked', label: 'Ont cliqué' },
  { value: 'unsubscribed', label: 'Désinscrits' },
  { value: 'failed', label: 'Échecs' },
  { value: 'pending', label: 'En attente' },
]

function postmarkFor(campaign: Data.Campaign) {
  const day = (value: string | null) =>
    value
      ? new Date(value).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit',
        })
      : ''
  switch (campaign.status) {
    case 'sent':
      return (
        <Postmark
          ring="Envoyée par Missivox"
          date={day(campaign.finishedAt ?? campaign.startedAt)}
        />
      )
    case 'cancelled':
      return <Postmark ring="Envoi annulé" date={day(campaign.finishedAt)} tone="cancelled" />
    case 'scheduled':
      return <Postmark ring="Départ prévu" date={day(campaign.scheduledAt)} tone="pending" />
    default:
      return <Postmark ring="En cours d'envoi" date={day(campaign.startedAt)} tone="pending" />
  }
}

export default function CampaignShow({
  campaign,
  stats,
  links,
  activity,
  recipients,
  recipientsMeta,
  filters,
  worker,
}: Props) {
  const [query, setQuery] = useState(filters.q)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const live = campaign.status === 'sending' || campaign.status === 'scheduled'

  /**
   * Refreshes the figures while the campaign is sending.
   */
  useEffect(() => {
    if (!live) return
    const timer = setInterval(() => {
      router.reload({
        only: ['campaign', 'stats', 'links', 'activity', 'recipients', 'recipientsMeta', 'worker'],
      })
    }, 4000)
    return () => clearInterval(timer)
  }, [live])

  useEffect(() => () => clearTimeout(searchTimer.current), [])

  const filterRecipients = (next: Partial<typeof filters>) => {
    const params = { ...filters, q: query, ...next }
    router.get(
      urlFor('campaigns.show', { id: campaign.id }),
      Object.fromEntries(Object.entries(params).filter(([, value]) => value)),
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
        only: ['recipients', 'recipientsMeta', 'filters'],
      }
    )
  }

  const search = (value: string) => {
    setQuery(value)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => filterRecipients({ q: value }), 300)
  }

  const processed = stats.sent + stats.failed + stats.skipped
  const progress = stats.recipients > 0 ? Math.round((processed / stats.recipients) * 100) : 0
  const hasActivity = activity.some((point) => point.opens + point.clicks > 0)

  return (
    <Page
      title={campaign.name}
      aside={postmarkFor(campaign)}
      description={
        <span className="stack" style={{ gap: 6 }}>
          <span>{campaign.subject}</span>
          <span className="row" style={{ gap: 8 }}>
            <StatusBadge kind="campaign" status={campaign.status} />
            {(campaign.lists ?? []).map((list) => (
              <span key={list.id} className="chip">
                {list.name}
              </span>
            ))}
          </span>
        </span>
      }
      back={{ href: urlFor('campaigns.index'), label: 'Campagnes' }}
      actions={
        <>
          <a
            href={urlFor('previews.campaign', { id: campaign.id })}
            target="_blank"
            rel="noreferrer"
            className="btn btn--ghost"
          >
            <Eye size={16} /> Voir l’email
          </a>
          <ConfirmAction
            url={urlFor('campaigns.duplicate', { id: campaign.id })}
            title="Dupliquer la campagne ?"
            description="Une copie en brouillon est créée, avec le même contenu et les mêmes listes."
            confirmLabel="Dupliquer"
            className="btn btn--secondary"
          >
            <Copy size={16} /> Dupliquer
          </ConfirmAction>
          {campaign.status === 'scheduled' && (
            <ConfirmAction
              url={urlFor('campaign_actions.unschedule', { id: campaign.id })}
              title="Annuler la programmation ?"
              description="La campagne repasse en brouillon : vous pourrez la modifier et la reprogrammer."
              confirmLabel="Repasser en brouillon"
              className="btn btn--secondary"
            >
              <Undo2 size={16} /> Repasser en brouillon
            </ConfirmAction>
          )}
          {campaign.status === 'sending' && (
            <ConfirmAction
              url={urlFor('campaign_actions.pause', { id: campaign.id })}
              title="Mettre l'envoi en pause ?"
              description="Les emails déjà partis le restent. Vous pourrez reprendre plus tard."
              confirmLabel="Mettre en pause"
              className="btn btn--secondary"
            >
              <Pause size={16} /> Pause
            </ConfirmAction>
          )}
          {campaign.status === 'paused' && (
            <ConfirmAction
              url={urlFor('campaign_actions.resume', { id: campaign.id })}
              title="Reprendre l'envoi ?"
              description={`${plural(stats.pending, 'email restant', 'emails restants')} à envoyer.`}
              confirmLabel="Reprendre"
              className="btn btn--primary"
            >
              <Play size={16} /> Reprendre
            </ConfirmAction>
          )}
          {(campaign.status === 'sending' || campaign.status === 'paused') && (
            <ConfirmAction
              url={urlFor('campaign_actions.cancel', { id: campaign.id })}
              title="Annuler l'envoi ?"
              description="Les emails qui ne sont pas encore partis ne partiront jamais. C'est définitif."
              confirmLabel="Annuler l'envoi"
              danger
              className="btn btn--danger-ghost"
            >
              <X size={16} /> Annuler l’envoi
            </ConfirmAction>
          )}
          {campaign.isDeletable && campaign.status !== 'scheduled' && (
            <ConfirmAction
              url={urlFor('campaigns.destroy', { id: campaign.id })}
              method="delete"
              title="Supprimer la campagne ?"
              description="La campagne et ses statistiques seront supprimées."
              confirmLabel="Supprimer"
              danger
              className="btn btn--danger-ghost"
            >
              <Trash2 size={16} /> Supprimer
            </ConfirmAction>
          )}
        </>
      }
    >
      <WorkerAlert
        worker={worker}
        hasPendingEmails={campaign.status === 'sending' && stats.pending > 0}
      />

      {campaign.status === 'scheduled' && (
        <div className="alert alert--warn" style={{ marginBottom: 20 }}>
          <CalendarClock size={16} />
          <div>
            Départ prévu le <strong>{formatDateTime(campaign.scheduledAt)}</strong> (
            {formatRelative(campaign.scheduledAt)}). Les destinataires seront arrêtés à ce
            moment-là.
          </div>
        </div>
      )}

      {(campaign.status === 'sending' || campaign.status === 'paused') && (
        <section className="panel" style={{ marginBottom: 20 }}>
          <div className="row row--between" style={{ marginBottom: 10 }}>
            <strong>
              {campaign.status === 'paused' ? 'Envoi en pause' : 'Envoi en cours'} :{' '}
              {formatNumber(processed)} sur {formatNumber(stats.recipients)}
            </strong>
            <span className="muted">{progress} %</span>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
        </section>
      )}

      {campaign.status !== 'scheduled' && (
        <div className="stack" style={{ gap: 20 }}>
          <section className="figures" aria-label="Résultats">
            <div className="figure">
              <div className="figure__label">Envoyés</div>
              <div className="figure__value">{formatNumber(stats.sent)}</div>
              <div className="figure__detail">
                {stats.failed > 0 ? `${plural(stats.failed, 'échec')}, ` : ''}
                sur {plural(stats.recipients, 'destinataire')}
              </div>
            </div>
            <div className="figure">
              <div className="figure__label">Ouvertures</div>
              <div className="figure__value">{formatPercent(stats.openRate)}</div>
              <div className="figure__detail">
                {plural(stats.opened, 'personne')}, {plural(stats.opens, 'ouverture')}
              </div>
              <div className="figure__meter">
                <span style={{ width: `${Math.min(100, stats.openRate)}%` }} />
              </div>
            </div>
            <div className="figure">
              <div className="figure__label">Clics</div>
              <div className="figure__value">{formatPercent(stats.clickRate)}</div>
              <div className="figure__detail">
                {plural(stats.clicked, 'personne')}, {formatPercent(stats.clickToOpenRate)} des
                lecteurs
              </div>
              <div className="figure__meter">
                <span style={{ width: `${Math.min(100, stats.clickRate)}%` }} />
              </div>
            </div>
            <div className="figure">
              <div className="figure__label">Désinscriptions</div>
              <div className="figure__value">{formatNumber(stats.unsubscribed)}</div>
              <div className="figure__detail">
                {stats.sent > 0
                  ? formatPercent(Math.round((stats.unsubscribed / stats.sent) * 1000) / 10)
                  : '—'}{' '}
                des envoyés
              </div>
            </div>
          </section>

          <div className="grid-2" style={{ alignItems: 'start' }}>
            <section className="panel">
              <h2 className="panel__title">Activité des 48 premières heures</h2>
              <p className="panel__description" style={{ marginBottom: 12 }}>
                Ouvertures et clics, heure par heure.
              </p>
              {hasActivity ? (
                <BarChart
                  label="Ouvertures"
                  secondaryLabel="Clics"
                  points={activity.map((point) => ({
                    key: point.at,
                    value: point.opens,
                    secondary: point.clicks,
                    title: `${formatDate(point.at)} ${formatTime(point.at)} : ${plural(point.opens, 'ouverture')}, ${plural(point.clicks, 'clic')}`,
                  }))}
                  axis={[
                    formatDateTime(activity[0]?.at),
                    formatDateTime(activity[activity.length - 1]?.at),
                  ]}
                />
              ) : (
                <p className="muted" style={{ fontSize: 14 }}>
                  Pas encore d’ouverture. Les premières arrivent en général dans l’heure.
                </p>
              )}
            </section>

            <section className="panel panel--flush">
              <div style={{ padding: '22px 22px 6px' }}>
                <h2 className="panel__title">Liens cliqués</h2>
              </div>
              {links.length === 0 ? (
                <p className="muted" style={{ padding: '0 22px 22px', fontSize: 14 }}>
                  {campaign.trackClicks
                    ? 'Cet email ne contient pas de lien suivi.'
                    : 'Le suivi des clics était désactivé pour cette campagne.'}
                </p>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Lien</th>
                      <th className="num">Clics</th>
                      <th className="num">Personnes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {links.map((link) => (
                      <tr key={link.id}>
                        <td style={{ maxWidth: 260 }}>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="il truncate"
                            style={{ display: 'block' }}
                          >
                            {link.url.replace(/^https?:\/\//, '')}
                          </a>
                        </td>
                        <td className="num">{formatNumber(link.clicks)}</td>
                        <td className="num">{formatNumber(link.clickers)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>

          <section>
            <div className="row row--between" style={{ marginBottom: 12 }}>
              <h2 className="panel__title">Destinataires</h2>
            </div>
            <div className="toolbar">
              <div className="tabs" role="tablist" aria-label="Filtrer les destinataires">
                {RECIPIENT_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    role="tab"
                    className="tabs__tab"
                    aria-selected={filters.status === filter.value}
                    onClick={() => filterRecipients({ status: filter.value })}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <div className="search">
                <Search size={16} />
                <input
                  type="search"
                  className="field__input"
                  placeholder="Rechercher une adresse"
                  value={query}
                  onChange={(event) => search(event.target.value)}
                  aria-label="Rechercher une adresse"
                />
              </div>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Adresse</th>
                    <th>Envoi</th>
                    <th>Ouvert</th>
                    <th>Cliqué</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="muted"
                        style={{ textAlign: 'center', padding: 28 }}
                      >
                        Aucun destinataire ne correspond.
                      </td>
                    </tr>
                  )}
                  {recipients.map((recipient) => (
                    <tr key={recipient.id}>
                      <td>
                        {recipient.contactId ? (
                          <Link
                            route="contacts.show"
                            routeParams={{ id: recipient.contactId }}
                            className="cell-title"
                          >
                            {recipient.email}
                          </Link>
                        ) : (
                          <span className="cell-title">{recipient.email}</span>
                        )}
                        {recipient.unsubscribedAt && (
                          <span className="cell-sub">
                            S’est désinscrit le {formatDateTime(recipient.unsubscribedAt)}
                          </span>
                        )}
                        {recipient.error && recipient.status !== 'sent' && (
                          <span
                            className="cell-sub truncate"
                            style={{ maxWidth: 360 }}
                            title={recipient.error}
                          >
                            {recipient.error}
                          </span>
                        )}
                      </td>
                      <td className="nowrap">
                        <StatusBadge kind="recipient" status={recipient.status} />
                        {recipient.sentAt && (
                          <span className="cell-sub">{formatDateTime(recipient.sentAt)}</span>
                        )}
                      </td>
                      <td className="nowrap">
                        {recipient.openedAt ? (
                          <>
                            {formatDateTime(recipient.openedAt)}
                            {recipient.openCount > 1 && (
                              <span className="cell-sub">{recipient.openCount} fois</span>
                            )}
                          </>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td className="nowrap">
                        {recipient.clickedAt ? (
                          <>
                            {formatDateTime(recipient.clickedAt)}
                            {recipient.clickCount > 1 && (
                              <span className="cell-sub">{recipient.clickCount} clics</span>
                            )}
                          </>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={recipientsMeta.currentPage}
              lastPage={recipientsMeta.lastPage}
              total={recipientsMeta.total}
              noun={recipientsMeta.total > 1 ? 'destinataires' : 'destinataire'}
            />
          </section>

          <section className="panel">
            <h2 className="panel__title" style={{ marginBottom: 14 }}>
              Détails
            </h2>
            <dl className="kv">
              <dt>Objet</dt>
              <dd>{campaign.subject}</dd>
              <dt>Expéditeur</dt>
              <dd>
                {campaign.fromName} &lt;{campaign.fromEmail}&gt;
              </dd>
              {campaign.replyTo && (
                <>
                  <dt>Réponses à</dt>
                  <dd>{campaign.replyTo}</dd>
                </>
              )}
              <dt>Départ</dt>
              <dd>{formatDateTime(campaign.startedAt)}</dd>
              <dt>Fin</dt>
              <dd>{formatDateTime(campaign.finishedAt)}</dd>
              <dt>Suivi</dt>
              <dd>
                {[campaign.trackOpens && 'ouvertures', campaign.trackClicks && 'clics']
                  .filter(Boolean)
                  .join(' et ') || 'désactivé'}
              </dd>
            </dl>
          </section>
        </div>
      )}
    </Page>
  )
}

CampaignShow.layout = [AppLayout]
