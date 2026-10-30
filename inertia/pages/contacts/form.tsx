import { type FormEvent } from 'react'
import { useForm } from '@inertiajs/react'
import { Plus, X } from 'lucide-react'
import Page from '~/components/page'
import AppLayout from '~/layouts/app'
import { urlFor } from '~/client'
import ListPicker from '~/components/list_picker'
import { type Data } from '@generated/data'
import { type InertiaProps } from '~/types'

type Props = InertiaProps<{
  contact: Data.Contact | null
  lists: Data.List[]
}>

type ContactStatus = 'subscribed' | 'unsubscribed' | 'bounced'

export default function ContactForm({ contact, lists }: Props) {
  const form = useForm({
    email: contact?.email ?? '',
    firstName: contact?.firstName ?? '',
    lastName: contact?.lastName ?? '',
    company: contact?.company ?? '',
    phone: contact?.phone ?? '',
    status: (contact?.status ?? 'subscribed') as ContactStatus,
    listIds: (contact?.lists ?? []).map((list) => list.id),
    attributes: Object.entries(contact?.attributes ?? {}).map(([name, value]) => ({
      name,
      value: String(value),
    })),
  })
  const errors = form.errors as Record<string, string | undefined>

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (contact) form.put(urlFor('contacts.update', { id: contact.id }))
    else form.post(urlFor('contacts.store'))
  }

  const setAttribute = (index: number, key: 'name' | 'value', value: string) =>
    form.setData(
      'attributes',
      form.data.attributes.map((row, i) => (i === index ? { ...row, [key]: value } : row))
    )

  const title = contact ? `Modifier ${contact.fullName ?? contact.email}` : 'Nouveau contact'
  const back = contact
    ? { href: urlFor('contacts.show', { id: contact.id }), label: 'Retour à la fiche' }
    : { href: urlFor('contacts.index'), label: 'Contacts' }

  return (
    <Page title={title} back={back} width="narrow">
      <form onSubmit={submit} className="panel" noValidate>
        <section className="section">
          <div className="section__body">
            <div className="field">
              <label className="field__label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="field__input"
                value={form.data.email}
                onChange={(event) => form.setData('email', event.target.value)}
                aria-invalid={errors.email ? 'true' : 'false'}
                autoFocus={!contact}
              />
              {errors.email && <span className="field__error">{errors.email}</span>}
            </div>
            <div className="fields-row">
              <div className="field">
                <label className="field__label" htmlFor="firstName">
                  Prénom <span className="field__optional">(facultatif)</span>
                </label>
                <input
                  id="firstName"
                  className="field__input"
                  value={form.data.firstName}
                  onChange={(event) => form.setData('firstName', event.target.value)}
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="lastName">
                  Nom <span className="field__optional">(facultatif)</span>
                </label>
                <input
                  id="lastName"
                  className="field__input"
                  value={form.data.lastName}
                  onChange={(event) => form.setData('lastName', event.target.value)}
                />
              </div>
            </div>
            <div className="fields-row">
              <div className="field">
                <label className="field__label" htmlFor="company">
                  Entreprise <span className="field__optional">(facultatif)</span>
                </label>
                <input
                  id="company"
                  className="field__input"
                  value={form.data.company}
                  onChange={(event) => form.setData('company', event.target.value)}
                />
              </div>
              <div className="field">
                <label className="field__label" htmlFor="phone">
                  Téléphone <span className="field__optional">(facultatif)</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="field__input"
                  value={form.data.phone}
                  onChange={(event) => form.setData('phone', event.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <header className="section__header">
            <h2 className="section__title">Abonnement</h2>
            <p className="section__description">
              Seuls les contacts inscrits reçoivent les campagnes.
            </p>
          </header>
          <div className="section__body">
            <div className="field" style={{ maxWidth: 280 }}>
              <label className="field__label" htmlFor="status">
                Statut
              </label>
              <select
                id="status"
                className="field__input"
                value={form.data.status}
                onChange={(event) => form.setData('status', event.target.value as ContactStatus)}
              >
                <option value="subscribed">Inscrit</option>
                <option value="unsubscribed">Désinscrit</option>
                <option value="bounced">Adresse invalide</option>
              </select>
            </div>
            <div className="field">
              <span className="field__label">Listes</span>
              <ListPicker
                lists={lists}
                value={form.data.listIds}
                onChange={(value) => form.setData('listIds', value)}
              />
            </div>
          </div>
        </section>

        <section className="section">
          <header className="section__header">
            <h2 className="section__title">Champs personnalisés</h2>
            <p className="section__description">
              Des informations en plus, utilisables dans les emails avec{' '}
              <code className="mono">{'{{ attr.nom_du_champ }}'}</code>.
            </p>
          </header>
          <div className="section__body" style={{ gap: 10 }}>
            {form.data.attributes.map((row, index) => (
              <div key={index} className="row" style={{ flexWrap: 'nowrap' }}>
                <input
                  className="field__input"
                  placeholder="Nom, ex. ville"
                  value={row.name}
                  onChange={(event) => setAttribute(index, 'name', event.target.value)}
                  aria-label="Nom du champ"
                />
                <input
                  className="field__input"
                  placeholder="Valeur"
                  value={row.value}
                  onChange={(event) => setAttribute(index, 'value', event.target.value)}
                  aria-label="Valeur du champ"
                />
                <button
                  type="button"
                  className="iconbtn"
                  onClick={() =>
                    form.setData(
                      'attributes',
                      form.data.attributes.filter((_, i) => i !== index)
                    )
                  }
                  aria-label="Retirer ce champ"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <div>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() =>
                  form.setData('attributes', [...form.data.attributes, { name: '', value: '' }])
                }
              >
                <Plus size={15} /> Ajouter un champ
              </button>
            </div>
          </div>
        </section>

        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 26 }}>
          <a href={back.href} className="btn btn--secondary">
            Annuler
          </a>
          <button type="submit" className="btn btn--primary" disabled={form.processing}>
            {form.processing ? 'Enregistrement…' : contact ? 'Enregistrer' : 'Ajouter le contact'}
          </button>
        </div>
      </form>
    </Page>
  )
}

ContactForm.layout = [AppLayout]
