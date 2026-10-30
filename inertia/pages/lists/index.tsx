import { type FormEvent, useState } from 'react'
import { useForm } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { ListChecks, Pencil, Plus, Trash2, Upload } from 'lucide-react'
import Page from '~/components/page'
import AppLayout from '~/layouts/app'
import { urlFor } from '~/client'
import Modal from '~/components/modal'
import EmptyState from '~/components/empty_state'
import ConfirmAction from '~/components/confirm_action'
import { type Data } from '@generated/data'
import { type InertiaProps } from '~/types'
import { formatNumber } from '~/lib/format'

type ListWithCounts = Data.List.Variants['withCounts']

type Props = InertiaProps<{ lists: ListWithCounts[] }>

function ListDialog({
  list,
  open,
  onClose,
}: {
  list: ListWithCounts | null
  open: boolean
  onClose: () => void
}) {
  const form = useForm({ name: list?.name ?? '', description: list?.description ?? '' })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const options = { onSuccess: () => onClose(), preserveScroll: true }
    if (list) form.put(urlFor('lists.update', { id: list.id }), options)
    else form.post(urlFor('lists.store'), options)
  }

  return (
    <Modal open={open} onClose={onClose} title={list ? 'Modifier la liste' : 'Nouvelle liste'}>
      <form onSubmit={submit} className="stack" noValidate>
        <div className="field">
          <label className="field__label" htmlFor="list-name">
            Nom
          </label>
          <input
            id="list-name"
            className="field__input"
            value={form.data.name}
            onChange={(event) => form.setData('name', event.target.value)}
            placeholder="Clients fidèles"
            aria-invalid={form.errors.name ? 'true' : 'false'}
            autoFocus
          />
          {form.errors.name && <span className="field__error">{form.errors.name}</span>}
        </div>
        <div className="field">
          <label className="field__label" htmlFor="list-description">
            Description <span className="field__optional">(facultatif)</span>
          </label>
          <textarea
            id="list-description"
            className="field__input"
            value={form.data.description}
            onChange={(event) => form.setData('description', event.target.value)}
            placeholder="À qui sert cette liste ?"
          />
        </div>
        <div className="row" style={{ justifyContent: 'flex-end', paddingBottom: 18 }}>
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="btn btn--primary" disabled={form.processing}>
            {list ? 'Enregistrer' : 'Créer la liste'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function ListsIndex({ lists }: Props) {
  const [editing, setEditing] = useState<ListWithCounts | 'new' | null>(null)

  return (
    <Page
      title="Listes"
      description="Regroupez vos contacts pour choisir qui reçoit chaque campagne. Un contact peut appartenir à plusieurs listes."
      actions={
        <button type="button" className="btn btn--primary" onClick={() => setEditing('new')}>
          <Plus size={16} /> Nouvelle liste
        </button>
      }
    >
      {lists.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={ListChecks}
            title="Aucune liste"
            action={
              <button type="button" className="btn btn--primary" onClick={() => setEditing('new')}>
                Créer une liste
              </button>
            }
          >
            Par exemple « Clients », « Prospects » ou « Newsletter ».
          </EmptyState>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Liste</th>
                <th className="num">Inscrits</th>
                <th className="num">Total</th>
                <th className="actions-cell">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {lists.map((list) => (
                <tr key={list.id}>
                  <td>
                    <Link route="contacts.index" qs={{ list: list.id }} className="cell-title">
                      {list.name}
                    </Link>
                    {list.description && <span className="cell-sub">{list.description}</span>}
                  </td>
                  <td className="num">{formatNumber(list.subscribedCount)}</td>
                  <td className="num muted">{formatNumber(list.contactsCount)}</td>
                  <td className="actions-cell">
                    <div className="row" style={{ flexWrap: 'nowrap', gap: 2 }}>
                      <Link
                        route="contact_imports.create"
                        qs={{ list: list.id }}
                        className="iconbtn"
                        title="Importer dans cette liste"
                      >
                        <Upload size={16} />
                      </Link>
                      <button
                        type="button"
                        className="iconbtn"
                        onClick={() => setEditing(list)}
                        title="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <ConfirmAction
                        url={urlFor('lists.destroy', { id: list.id })}
                        method="delete"
                        title={`Supprimer « ${list.name} » ?`}
                        description="Les contacts de la liste sont conservés : ils en sont seulement retirés."
                        confirmLabel="Supprimer la liste"
                        danger
                        className="iconbtn"
                      >
                        <Trash2 size={16} />
                      </ConfirmAction>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ListDialog
          key={editing === 'new' ? 'new' : editing.id}
          list={editing === 'new' ? null : editing}
          open
          onClose={() => setEditing(null)}
        />
      )}
    </Page>
  )
}

ListsIndex.layout = [AppLayout]
