import { usePage, useForm } from '@inertiajs/react'
import Page from '~/components/page'
import AppLayout from '~/layouts/app'
import { urlFor } from '~/client'
import EmailEditor, { type EditorMode } from '~/components/email_editor'
import EmailPreview from '~/components/email_preview'
import { type Data } from '@generated/data'
import { type InertiaProps } from '~/types'

type Props = InertiaProps<{
  template: Data.Template | null
  starterBody: string
}>

export default function TemplateForm({ template, starterBody }: Props) {
  const { user } = usePage().props
  const form = useForm({
    name: template?.name ?? '',
    subject: template?.subject ?? '',
    editor: (template?.editor ?? 'visual') as EditorMode,
    body: template?.body ?? starterBody,
  })

  const save = () => {
    if (template)
      form.put(urlFor('templates.update', { id: template.id }), { preserveScroll: true })
    else form.post(urlFor('templates.store'))
  }

  return (
    <Page
      title={template ? template.name : 'Nouveau modèle'}
      back={{ href: urlFor('templates.index'), label: 'Modèles' }}
      width="wide"
      actions={
        <button
          type="button"
          className="btn btn--primary"
          onClick={save}
          disabled={form.processing || (!!template && !form.isDirty)}
        >
          {form.processing ? 'Enregistrement…' : template ? 'Enregistrer' : 'Créer le modèle'}
        </button>
      }
    >
      <div className="composer">
        <div className="stack" style={{ gap: 20 }}>
          <div className="panel">
            <div className="fields-row">
              <div className="field">
                <label className="field__label" htmlFor="name">
                  Nom du modèle
                </label>
                <input
                  id="name"
                  className="field__input"
                  value={form.data.name}
                  onChange={(event) => form.setData('name', event.target.value)}
                  placeholder="Newsletter mensuelle"
                  aria-invalid={form.errors.name ? 'true' : 'false'}
                />
                {form.errors.name && <span className="field__error">{form.errors.name}</span>}
              </div>
              <div className="field">
                <label className="field__label" htmlFor="subject">
                  Objet proposé <span className="field__optional">(facultatif)</span>
                </label>
                <input
                  id="subject"
                  className="field__input"
                  value={form.data.subject}
                  onChange={(event) => form.setData('subject', event.target.value)}
                />
              </div>
            </div>
          </div>
          <EmailEditor
            mode={form.data.editor}
            value={form.data.body}
            onChange={(body) => form.setData('body', body)}
            onModeChange={(mode) => form.setData('editor', mode)}
          />
          {form.errors.body && <span className="field__error">{form.errors.body}</span>}
        </div>
        <div className="composer__preview">
          <EmailPreview
            fromName={user?.fullName ?? 'Votre entreprise'}
            subject={form.data.subject}
            preheader={null}
            editor={form.data.editor}
            body={form.data.body}
          />
        </div>
      </div>
    </Page>
  )
}

TemplateForm.layout = [AppLayout]
