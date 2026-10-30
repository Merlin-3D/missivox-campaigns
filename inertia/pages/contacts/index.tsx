import { useEffect, useRef, useState } from 'react'
import { router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { Download, Plus, Search, Upload, Users } from 'lucide-react'
import Page from '~/components/page'
import AppLayout from '~/layouts/app'
import { urlFor } from '~/client'
import Modal from '~/components/modal'
import Pagination from '~/components/pagination'
import EmptyState from '~/components/empty_state'
import StatusBadge from '~/components/status_badge'
import { type Data } from '@generated/data'
import { type InertiaProps } from '~/types'
import { formatDate, plural } from '~/lib/format'

type Props = InertiaProps<{
  contacts: Data.Contact[]
  meta: { total: number; currentPage: number; lastPage: number; perPage: number }
  filters: { q: string; status: string; list: number | null }
  lists: Data.List[]
}>

type BulkAction = 'add_to_list' | 'remove_from_list' | 'unsubscribe' | 'resubscribe' | 'delete'

export default function ContactsIndex({ contacts, meta, filters, lists }: Props) {
  const [query, setQuery] = useState(filters.q)
  const [bulkAction, setBulkAction] = useState<BulkAction>('add_to_list')
  const [bulkList, setBulkList] = useState<number | ''>(lists[0]?.id ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  /**
   * The selection belongs to the page of contacts it was made on: a new
   * page, filter or bulk action starts from an empty selection.
   */
  const [selection, setSelection] = useState({ page: contacts, ids: [] as number[] })
  const selected = selection.page === contacts ? selection.ids : []
  const setSelected = (ids: number[]) => setSelection({ page: contacts, ids })

  const applyFilters = (next: Partial<typeof filters>) => {
    const params = { ...filters, q: query, ...next }
    router.get(
      urlFor('contacts.index'),
      Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== '' && value !== null)
      ),
      { preserveState: true, preserveScroll: true, replace: true }
    )
  }

  /**
   * Searches as the user types, once they pause.
   */
  const search = (value: string) => {
    setQuery(value)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => applyFilters({ q: value }), 300)
  }
  useEffect(() => () => clearTimeout(searchTimer.current), [])

  const allSelected = contacts.length > 0 && selected.length === contacts.length
  const toggleAll = () => setSelected(allSelected ? [] : contacts.map((contact) => contact.id))
  const toggle = (id: number) =>
    setSelected(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id])

  const runBulk = () => {
    if (bulkAction === 'delete' && !confirmDelete) {
      setConfirmDelete(true)
      return
    }
    router.post(
      urlFor('contacts.bulk'),
      {
        ids: selected,
        action: bulkAction,
        ...(bulkAction === 'add_to_list' || bulkAction === 'remove_from_list'
          ? { listId: bulkList || undefined }
          : {}),
      },
      { preserveScroll: true, onFinish: () => setConfirmDelete(false) }
    )
  }

  const hasFilters = !!(filters.q || filters.status || filters.list)
  const exportQuery = new URLSearchParams(
    Object.entries({ q: filters.q, status: filters.status, list: filters.list ?? '' }).filter(
      ([, value]) => value !== ''
    ) as [string, string][]
  ).toString()

  return (
    <Page
      title="Contacts"
      description="Les personnes qui peuvent recevoir vos campagnes."
      actions={
        <>
          <a
            href={`${urlFor('contacts.export')}${exportQuery ? `?${exportQuery}` : ''}`}
            className="btn btn--secondary"
          >
            <Download size={16} /> Exporter
          </a>
          <Link route="contact_imports.create" className="btn btn--secondary">
            <Upload size={16} /> Importer
          </Link>
          <Link route="contacts.create" className="btn btn--primary">
            <Plus size={16} /> Ajouter un contact
          </Link>
        </>
      }
    >
      <div className="toolbar">
        <div className="search">
          <Search size={16} />
          <input
            type="search"
            className="field__input"
            placeholder="Rechercher un nom, un email, une entreprise"
            value={query}
            onChange={(event) => search(event.target.value)}
            aria-label="Rechercher"
          />
        </div>
        <select
          className="field__input"
          value={filters.status}
          onChange={(event) => applyFilters({ status: event.target.value })}
          aria-label="Filtrer par statut"
        >
          <option value="">Tous les statuts</option>
          <option value="subscribed">Inscrits</option>
          <option value="unsubscribed">Désinscrits</option>
          <option value="bounced">Adresses invalides</option>
        </select>
        <select
          className="field__input"
          value={filters.list ?? ''}
          onChange={(event) =>
            applyFilters({ list: event.target.value ? Number(event.target.value) : null })
          }
          aria-label="Filtrer par liste"
        >
          <option value="">Toutes les listes</option>
          {lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </select>
      </div>

      {selected.length > 0 && (
        <div className="bulkbar">
          <strong>{plural(selected.length, 'contact sélectionné', 'contacts sélectionnés')}</strong>
          <select
            value={bulkAction}
            onChange={(event) => setBulkAction(event.target.value as BulkAction)}
            aria-label="Action"
          >
            <option value="add_to_list">Ajouter à la liste</option>
            <option value="remove_from_list">Retirer de la liste</option>
            <option value="unsubscribe">Désinscrire</option>
            <option value="resubscribe">Réinscrire</option>
            <option value="delete">Supprimer</option>
          </select>
          {(bulkAction === 'add_to_list' || bulkAction === 'remove_from_list') && (
            <select
              value={bulkList}
              onChange={(event) => setBulkList(Number(event.target.value))}
              aria-label="Liste"
            >
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          )}
          <button type="button" className="btn btn--secondary btn--sm" onClick={runBulk}>
            Appliquer
          </button>
          <button
            type="button"
            className="btn btn--sm"
            style={{ marginLeft: 'auto', color: 'inherit' }}
            onClick={() => setSelected([])}
          >
            Désélectionner
          </button>
        </div>
      )}

      {contacts.length === 0 ? (
        <div className="panel">
          {hasFilters ? (
            <EmptyState icon={Search} title="Aucun contact ne correspond">
              Modifiez la recherche ou les filtres.
            </EmptyState>
          ) : (
            <EmptyState
              icon={Users}
              title="Aucun contact pour l'instant"
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
              Importez vos clients depuis un tableur ou ajoutez-les un par un.
            </EmptyState>
          )}
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="check-cell">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Tout sélectionner"
                    />
                  </th>
                  <th>Contact</th>
                  <th>Entreprise</th>
                  <th>Listes</th>
                  <th>Statut</th>
                  <th>Ajouté le</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id}>
                    <td className="check-cell">
                      <input
                        type="checkbox"
                        checked={selected.includes(contact.id)}
                        onChange={() => toggle(contact.id)}
                        aria-label={`Sélectionner ${contact.email}`}
                      />
                    </td>
                    <td>
                      <Link
                        route="contacts.show"
                        routeParams={{ id: contact.id }}
                        className="cell-title"
                      >
                        {contact.fullName ?? contact.email}
                      </Link>
                      {contact.fullName && <span className="cell-sub">{contact.email}</span>}
                    </td>
                    <td>{contact.company ?? <span className="muted">—</span>}</td>
                    <td>
                      <div className="tag-list">
                        {(contact.lists ?? []).map((list) => (
                          <span key={list.id} className="chip">
                            {list.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <StatusBadge kind="contact" status={contact.status} />
                    </td>
                    <td className="nowrap muted">{formatDate(contact.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={meta.currentPage}
            lastPage={meta.lastPage}
            total={meta.total}
            noun={meta.total > 1 ? 'contacts' : 'contact'}
          />
        </>
      )}

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={`Supprimer ${plural(selected.length, 'contact')} ?`}
        description="Ils disparaissent de vos listes. Les statistiques des campagnes déjà envoyées sont conservées."
        footer={
          <>
            <button className="btn btn--secondary" onClick={() => setConfirmDelete(false)}>
              Annuler
            </button>
            <button className="btn btn--danger" onClick={runBulk} autoFocus>
              Supprimer
            </button>
          </>
        }
      />
    </Page>
  )
}

ContactsIndex.layout = [AppLayout]
