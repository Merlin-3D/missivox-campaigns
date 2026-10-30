import { Link } from '@adonisjs/inertia/react'
import { Mail, Pencil, Trash2 } from 'lucide-react'
import Page from '~/components/page'
import AppLayout from '~/layouts/app'
import { urlFor } from '~/client'
import EmptyState from '~/components/empty_state'
import StatusBadge from '~/components/status_badge'
import ConfirmAction from '~/components/confirm_action'
import { type Data } from '@generated/data'
import { type InertiaProps } from '~/types'
import { CONTACT_SOURCE } from '~/lib/labels'
import { formatDate, formatDateTime } from '~/lib/format'

type Props = InertiaProps<{
  contact: Data.Contact
  deliveries: {
    id: number
    campaignId: number
    campaignName: string
    status: string
    sentAt: string | null
    openedAt: string | null
    openCount: number
    clickedAt: string | null
    clickCount: number
    unsubscribedAt: string | null
  }[]
}>

export default function ContactShow({ contact, deliveries }: Props) {
  const attributes = Object.entries(contact.attributes ?? {})

  return (
    <Page
      title={contact.fullName ?? contact.email}
      description={contact.fullName ? contact.email : undefined}
      back={{ href: urlFor('contacts.index'), label: 'Contacts' }}
      actions={
        <>
          <ConfirmAction
            url={urlFor('contacts.destroy', { id: contact.id })}
            method="delete"
            title="Supprimer ce contact ?"
            description={`${contact.email} sera retiré de toutes les listes. Les statistiques des campagnes déjà envoyées sont conservées.`}
            confirmLabel="Supprimer"
            danger
            className="btn btn--danger-ghost"
          >
            <Trash2 size={16} /> Supprimer
          </ConfirmAction>
          <Link
            route="contacts.edit"
            routeParams={{ id: contact.id }}
            className="btn btn--secondary"
          >
            <Pencil size={16} /> Modifier
          </Link>
        </>
      }
    >
      <div className="grid-detail">
        <section className="panel">
          <dl className="kv">
            <dt>Statut</dt>
            <dd>
              <StatusBadge kind="contact" status={contact.status} />
              {contact.unsubscribedAt && (
                <span className="cell-sub">le {formatDateTime(contact.unsubscribedAt)}</span>
              )}
            </dd>
            <dt>Entreprise</dt>
            <dd>{contact.company ?? '—'}</dd>
            <dt>Téléphone</dt>
            <dd>{contact.phone ?? '—'}</dd>
            <dt>Listes</dt>
            <dd>
              {(contact.lists ?? []).length > 0 ? (
                <div className="tag-list">
                  {(contact.lists ?? []).map((list) => (
                    <span key={list.id} className="chip">
                      {list.name}
                    </span>
                  ))}
                </div>
              ) : (
                '—'
              )}
            </dd>
            {attributes.map(([name, value]) => (
              <div key={name} style={{ display: 'contents' }}>
                <dt>{name}</dt>
                <dd>{String(value)}</dd>
              </div>
            ))}
            <dt>Origine</dt>
            <dd>{CONTACT_SOURCE[contact.source] ?? contact.source}</dd>
            <dt>Ajouté le</dt>
            <dd>{formatDate(contact.createdAt)}</dd>
          </dl>
        </section>

        <section className="panel panel--flush">
          <div style={{ padding: '20px 22px 4px' }}>
            <h2 className="panel__title">Emails reçus</h2>
            <p className="panel__description">Les 50 dernières campagnes envoyées à ce contact.</p>
          </div>
          {deliveries.length === 0 ? (
            <EmptyState icon={Mail} title="Aucun email envoyé">
              Ce contact n’a encore reçu aucune campagne.
            </EmptyState>
          ) : (
            <table className="table" style={{ marginTop: 10 }}>
              <thead>
                <tr>
                  <th>Campagne</th>
                  <th>Envoi</th>
                  <th>Lecture</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((delivery) => (
                  <tr key={delivery.id}>
                    <td>
                      <Link
                        route="campaigns.show"
                        routeParams={{ id: delivery.campaignId }}
                        className="cell-title"
                      >
                        {delivery.campaignName}
                      </Link>
                      {delivery.sentAt && (
                        <span className="cell-sub">{formatDateTime(delivery.sentAt)}</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge kind="recipient" status={delivery.status} />
                    </td>
                    <td className="nowrap" style={{ fontSize: 13.5 }}>
                      {delivery.unsubscribedAt ? (
                        <span className="badge badge--neutral badge--plain">S’est désinscrit</span>
                      ) : delivery.clickedAt ? (
                        `Cliqué ${delivery.clickCount} fois`
                      ) : delivery.openedAt ? (
                        `Ouvert ${delivery.openCount} fois`
                      ) : (
                        <span className="muted">Non ouvert</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </Page>
  )
}

ContactShow.layout = [AppLayout]
