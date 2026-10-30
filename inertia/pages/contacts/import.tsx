import { type FormEvent, useState } from 'react'
import { useForm } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { CircleCheck, FileUp, TriangleAlert } from 'lucide-react'
import Page from '~/components/page'
import AppLayout from '~/layouts/app'
import { urlFor } from '~/client'
import ListPicker from '~/components/list_picker'
import { type Data } from '@generated/data'
import { type InertiaProps } from '~/types'
import { formatNumber, plural } from '~/lib/format'
import type { ImportSummary } from '~/lib/server_types'

type Props = InertiaProps<{
  lists: Data.List[]
  preselectedListId: number | null
  summary: ImportSummary | null
}>

const EXAMPLE = `email;prenom;nom;entreprise;ville
camille.martin@example.com;Camille;Martin;Exemple SARL;Lyon
paul.durand@example.com;Paul;Durand;;Douala`

export default function ContactsImport({ lists, preselectedListId, summary }: Props) {
  const [dragging, setDragging] = useState(false)
  const form = useForm<{ file: File | null; listIds: number[]; updateExisting: boolean }>({
    file: null,
    listIds: preselectedListId ? [preselectedListId] : [],
    updateExisting: true,
  })
  const errors = form.errors as Record<string, string | undefined>

  const submit = (event: FormEvent) => {
    event.preventDefault()
    form.post(urlFor('contact_imports.store'), { forceFormData: true })
  }

  if (summary) {
    const imported = summary.created + summary.updated + summary.unchanged
    return (
      <Page
        title="Import terminé"
        back={{ href: urlFor('contacts.index'), label: 'Contacts' }}
        width="narrow"
      >
        <div className="panel stack">
          <div className="alert alert--ok">
            <CircleCheck size={16} />
            <div>
              {plural(imported, 'ligne importée', 'lignes importées')} sur{' '}
              {formatNumber(summary.total)}.
            </div>
          </div>
          <dl className="kv">
            <dt>Nouveaux contacts</dt>
            <dd>{formatNumber(summary.created)}</dd>
            <dt>Contacts mis à jour</dt>
            <dd>{formatNumber(summary.updated)}</dd>
            <dt>Déjà à jour</dt>
            <dd>{formatNumber(summary.unchanged)}</dd>
            <dt>Lignes ignorées</dt>
            <dd>{formatNumber(summary.invalid.length)}</dd>
          </dl>
          {summary.invalid.length > 0 && (
            <div className="alert alert--warn">
              <TriangleAlert size={16} />
              <div>
                <strong>Lignes ignorées, à corriger dans le fichier :</strong>
                <ul style={{ marginTop: 6 }}>
                  {summary.invalid.map((row) => (
                    <li key={row.line}>
                      Ligne {row.line} : {row.reason} ({row.value})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Link route="contact_imports.create" className="btn btn--secondary">
              Importer un autre fichier
            </Link>
            <Link route="contacts.index" className="btn btn--primary">
              Voir les contacts
            </Link>
          </div>
        </div>
      </Page>
    )
  }

  return (
    <Page
      title="Importer des contacts"
      description="Depuis un fichier CSV exporté d'Excel, Google Sheets ou de votre logiciel de facturation."
      back={{ href: urlFor('contacts.index'), label: 'Contacts' }}
      width="narrow"
    >
      <form onSubmit={submit} className="panel" noValidate>
        <section className="section">
          <div className="section__body">
            <label
              className="panel"
              style={{
                borderStyle: 'dashed',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragging ? 'var(--info-bg)' : 'var(--paper)',
              }}
              onDragOver={(event) => {
                event.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault()
                setDragging(false)
                const file = event.dataTransfer.files[0]
                if (file) form.setData('file', file)
              }}
            >
              <input
                type="file"
                accept=".csv,.txt,text/csv"
                className="sr-only"
                onChange={(event) => form.setData('file', event.target.files?.[0] ?? null)}
              />
              <FileUp size={26} style={{ color: 'var(--muted)' }} />
              <div style={{ marginTop: 8, fontWeight: 560 }}>
                {form.data.file ? form.data.file.name : 'Choisir un fichier CSV'}
              </div>
              <div className="field__hint">
                {form.data.file
                  ? `${formatNumber(Math.ceil(form.data.file.size / 1024))} Ko`
                  : 'ou déposez-le ici. 20 Mo maximum.'}
              </div>
            </label>
            {errors.file && <span className="field__error">{errors.file}</span>}

            <details>
              <summary className="il" style={{ cursor: 'pointer', fontSize: 14 }}>
                Format attendu
              </summary>
              <div className="stack" style={{ gap: 8, marginTop: 10, fontSize: 14 }}>
                <p className="muted">
                  Une ligne d’en-têtes, puis un contact par ligne. Seule la colonne email est
                  obligatoire ; les colonnes prénom, nom, entreprise et téléphone sont reconnues en
                  français ou en anglais. Les autres colonnes deviennent des champs personnalisés.
                  Séparateur virgule ou point-virgule.
                </p>
                <pre
                  className="mono"
                  style={{
                    fontSize: 12.5,
                    padding: 12,
                    background: 'var(--paper)',
                    borderRadius: 8,
                    overflowX: 'auto',
                  }}
                >
                  {EXAMPLE}
                </pre>
              </div>
            </details>
          </div>
        </section>

        <section className="section">
          <header className="section__header">
            <h2 className="section__title">Ajouter aux listes</h2>
            <p className="section__description">
              Les contacts importés, nouveaux ou existants, rejoignent ces listes.
            </p>
          </header>
          <div className="section__body">
            <ListPicker
              lists={lists}
              value={form.data.listIds}
              onChange={(value) => form.setData('listIds', value)}
            />
            <label className="check">
              <input
                type="checkbox"
                checked={form.data.updateExisting}
                onChange={(event) => form.setData('updateExisting', event.target.checked)}
              />
              <span className="check__text">
                Mettre à jour les contacts existants
                <span className="check__hint">
                  Les cases vides du fichier n’effacent rien. Les contacts désinscrits restent
                  désinscrits.
                </span>
              </span>
            </label>
          </div>
        </section>

        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 26 }}>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={!form.data.file || form.processing}
          >
            {form.processing ? 'Import en cours…' : 'Importer'}
          </button>
        </div>
      </form>
    </Page>
  )
}

ContactsImport.layout = [AppLayout]
