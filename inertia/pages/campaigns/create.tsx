import { type FormEvent } from 'react'
import { useForm } from '@inertiajs/react'
import Page from '~/components/page'
import AppLayout from '~/layouts/app'
import { urlFor } from '~/client'
import ListPicker from '~/components/list_picker'
import { type Data } from '@generated/data'
import { type InertiaProps } from '~/types'

type Props = InertiaProps<{
  lists: Data.List.Variants['withCounts'][]
  templates: Data.Template.Variants['summary'][]
  defaults: { fromName: string; fromEmail: string; replyTo: string | null }
}>

export default function CampaignCreate({ lists, templates, defaults }: Props) {
  const form = useForm({
    name: '',
    subject: '',
    templateId: null as number | null,
    listIds: [] as number[],
    fromName: defaults.fromName,
    fromEmail: defaults.fromEmail,
    replyTo: defaults.replyTo ?? '',
  })
  const errors = form.errors as Record<string, string | undefined>

  const submit = (event: FormEvent) => {
    event.preventDefault()
    form.post(urlFor('campaigns.store'))
  }

  return (
    <Page
      title="Nouvelle campagne"
      description="Les réglages de base. Vous écrirez le message à l'étape suivante."
      back={{ href: urlFor('campaigns.index'), label: 'Campagnes' }}
      width="narrow"
    >
      <form onSubmit={submit} className="panel" noValidate>
        <section className="section">
          <div className="section__body">
            <div className="field">
              <label className="field__label" htmlFor="name">
                Nom de la campagne
              </label>
              <input
                id="name"
                className="field__input"
                value={form.data.name}
                onChange={(event) => form.setData('name', event.target.value)}
                placeholder="Soldes d'hiver 2026"
                aria-invalid={errors.name ? 'true' : 'false'}
                autoFocus
              />
              {errors.name ? (
                <span className="field__error">{errors.name}</span>
              ) : (
                <span className="field__hint">
                  Pour vous retrouver ; vos contacts ne le voient pas.
                </span>
              )}
            </div>
            <div className="field">
              <label className="field__label" htmlFor="subject">
                Objet de l’email <span className="field__optional">(modifiable ensuite)</span>
              </label>
              <input
                id="subject"
                className="field__input"
                value={form.data.subject}
                onChange={(event) => form.setData('subject', event.target.value)}
                placeholder="{{ first_name }}, nos soldes commencent demain"
              />
            </div>
          </div>
        </section>

        <section className="section">
          <header className="section__header">
            <h2 className="section__title">Point de départ</h2>
          </header>
          <div className="section__body">
            <div className="list-picker">
              <label className="check">
                <input
                  type="radio"
                  name="template"
                  checked={form.data.templateId === null}
                  onChange={() => form.setData('templateId', null)}
                />
                <span className="check__text">
                  Page blanche
                  <span className="check__hint">Un exemple de contenu à remplacer.</span>
                </span>
              </label>
              {templates.map((template) => (
                <label key={template.id} className="check">
                  <input
                    type="radio"
                    name="template"
                    checked={form.data.templateId === template.id}
                    onChange={() => form.setData('templateId', template.id)}
                  />
                  <span className="check__text">
                    {template.name}
                    {template.subject && <span className="check__hint">{template.subject}</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <header className="section__header">
            <h2 className="section__title">Destinataires</h2>
            <p className="section__description">
              Un contact présent dans plusieurs listes ne reçoit l’email qu’une fois.
            </p>
          </header>
          <div className="section__body">
            <ListPicker
              lists={lists}
              value={form.data.listIds}
              onChange={(value) => form.setData('listIds', value)}
            />
          </div>
        </section>

        <section className="section">
          <header className="section__header">
            <h2 className="section__title">Expéditeur</h2>
          </header>
          <div className="section__body">
            <div className="fields-row">
              <div className="field">
                <label className="field__label" htmlFor="fromName">
                  Nom affiché
                </label>
                <input
                  id="fromName"
                  className="field__input"
                  value={form.data.fromName}
                  onChange={(event) => form.setData('fromName', event.target.value)}
                  aria-invalid={errors.fromName ? 'true' : 'false'}
                />
                {errors.fromName && <span className="field__error">{errors.fromName}</span>}
              </div>
              <div className="field">
                <label className="field__label" htmlFor="fromEmail">
                  Adresse d’envoi
                </label>
                <input
                  id="fromEmail"
                  type="email"
                  className="field__input"
                  value={form.data.fromEmail}
                  onChange={(event) => form.setData('fromEmail', event.target.value)}
                  aria-invalid={errors.fromEmail ? 'true' : 'false'}
                />
                {errors.fromEmail && <span className="field__error">{errors.fromEmail}</span>}
              </div>
            </div>
          </div>
        </section>

        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 26 }}>
          <button type="submit" className="btn btn--primary" disabled={form.processing}>
            {form.processing ? 'Création…' : 'Écrire le message'}
          </button>
        </div>
      </form>
    </Page>
  )
}

CampaignCreate.layout = [AppLayout]
