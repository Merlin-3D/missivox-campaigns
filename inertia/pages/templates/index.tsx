import { Link } from '@adonisjs/inertia/react'
import { Copy, LayoutTemplate, Plus, Trash2 } from 'lucide-react'
import Page from '~/components/page'
import AppLayout from '~/layouts/app'
import { urlFor } from '~/client'
import EmptyState from '~/components/empty_state'
import ConfirmAction from '~/components/confirm_action'
import { type Data } from '@generated/data'
import { type InertiaProps } from '~/types'
import { formatDate } from '~/lib/format'

type Props = InertiaProps<{ templates: Data.Template.Variants['summary'][] }>

export default function TemplatesIndex({ templates }: Props) {
  return (
    <Page
      title="Modèles"
      description="Des emails prêts à réutiliser : chaque nouvelle campagne peut partir d'un modèle."
      actions={
        <Link route="templates.create" className="btn btn--primary">
          <Plus size={16} /> Nouveau modèle
        </Link>
      }
    >
      {templates.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={LayoutTemplate}
            title="Aucun modèle"
            action={
              <Link route="templates.create" className="btn btn--primary">
                Créer un modèle
              </Link>
            }
          >
            Enregistrez votre mise en page habituelle (en-tête, signature, couleurs) pour ne pas la
            refaire à chaque campagne.
          </EmptyState>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Modèle</th>
                <th>Éditeur</th>
                <th>Modifié le</th>
                <th className="actions-cell">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id}>
                  <td>
                    <Link
                      route="templates.edit"
                      routeParams={{ id: template.id }}
                      className="cell-title"
                    >
                      {template.name}
                    </Link>
                    {template.subject && <span className="cell-sub">{template.subject}</span>}
                  </td>
                  <td>
                    <span className="chip">{template.editor === 'visual' ? 'Visuel' : 'HTML'}</span>
                  </td>
                  <td className="muted nowrap">{formatDate(template.updatedAt)}</td>
                  <td className="actions-cell">
                    <div className="row" style={{ flexWrap: 'nowrap', gap: 2 }}>
                      <ConfirmAction
                        url={urlFor('templates.duplicate', { id: template.id })}
                        title="Dupliquer ce modèle ?"
                        description="Une copie est créée, que vous pourrez modifier sans toucher à l'original."
                        confirmLabel="Dupliquer"
                        className="iconbtn"
                      >
                        <Copy size={16} />
                        <span className="sr-only">Dupliquer</span>
                      </ConfirmAction>
                      <ConfirmAction
                        url={urlFor('templates.destroy', { id: template.id })}
                        method="delete"
                        title={`Supprimer « ${template.name} » ?`}
                        description="Les campagnes créées à partir de ce modèle ne sont pas modifiées."
                        confirmLabel="Supprimer"
                        danger
                        className="iconbtn"
                      >
                        <Trash2 size={16} />
                        <span className="sr-only">Supprimer</span>
                      </ConfirmAction>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Page>
  )
}

TemplatesIndex.layout = [AppLayout]
