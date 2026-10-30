import { type FormEvent } from 'react'
import { usePage, useForm } from '@inertiajs/react'
import { Trash2, UserPlus } from 'lucide-react'
import AppLayout from '~/layouts/app'
import SettingsLayout from '~/layouts/settings'
import { urlFor } from '~/client'
import ConfirmAction from '~/components/confirm_action'
import { type Data } from '@generated/data'
import { type InertiaProps } from '~/types'
import { formatDate } from '~/lib/format'

type Props = InertiaProps<{ members: Data.User[] }>

export default function TeamSettings({ members }: Props) {
  const { user } = usePage().props
  const member = useForm({ fullName: '', email: '', password: '' })
  const password = useForm({ currentPassword: '', password: '', passwordConfirmation: '' })
  const passwordErrors = password.errors as Record<string, string | undefined>

  const addMember = (event: FormEvent) => {
    event.preventDefault()
    member.post(urlFor('team.store'), { preserveScroll: true, onSuccess: () => member.reset() })
  }

  const changePassword = (event: FormEvent) => {
    event.preventDefault()
    password.put(urlFor('team.update_password'), {
      preserveScroll: true,
      onSuccess: () => password.reset(),
    })
  }

  return (
    <div className="stack" style={{ gap: 20 }}>
      <section className="panel panel--flush">
        <div style={{ padding: '22px 22px 8px' }}>
          <h2 className="panel__title">Membres de l’équipe</h2>
          <p className="panel__description">
            Toutes les personnes ci-dessous peuvent gérer les contacts et envoyer des campagnes.
          </p>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Membre</th>
              <th>Depuis le</th>
              <th className="actions-cell">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="cell-title">{item.fullName ?? item.email}</span>
                  {item.fullName && <span className="cell-sub">{item.email}</span>}
                </td>
                <td className="muted nowrap">{formatDate(item.createdAt)}</td>
                <td className="actions-cell">
                  {item.id === user?.id ? (
                    <span className="badge badge--plain">Vous</span>
                  ) : (
                    <ConfirmAction
                      url={urlFor('team.destroy', { id: item.id })}
                      method="delete"
                      title={`Retirer ${item.fullName ?? item.email} ?`}
                      description="Cette personne ne pourra plus se connecter. Les campagnes qu'elle a créées sont conservées."
                      confirmLabel="Retirer l'accès"
                      danger
                      className="iconbtn"
                    >
                      <Trash2 size={16} />
                      <span className="sr-only">Retirer</span>
                    </ConfirmAction>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <form className="panel" onSubmit={addMember} noValidate>
        <header className="section__header">
          <h2 className="section__title">Ajouter un membre</h2>
          <p className="section__description">
            Transmettez-lui ce mot de passe ; il pourra le changer depuis cette page.
          </p>
        </header>
        <div className="section__body" style={{ marginTop: 18 }}>
          <div className="fields-row">
            <div className="field">
              <label className="field__label" htmlFor="member-name">
                Nom complet
              </label>
              <input
                id="member-name"
                className="field__input"
                value={member.data.fullName}
                onChange={(event) => member.setData('fullName', event.target.value)}
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="member-email">
                Email
              </label>
              <input
                id="member-email"
                type="email"
                className="field__input"
                value={member.data.email}
                onChange={(event) => member.setData('email', event.target.value)}
                aria-invalid={member.errors.email ? 'true' : 'false'}
              />
              {member.errors.email && <span className="field__error">{member.errors.email}</span>}
            </div>
          </div>
          <div className="field" style={{ maxWidth: 320 }}>
            <label className="field__label" htmlFor="member-password">
              Mot de passe provisoire
            </label>
            <input
              id="member-password"
              type="password"
              autoComplete="new-password"
              className="field__input"
              value={member.data.password}
              onChange={(event) => member.setData('password', event.target.value)}
              aria-invalid={member.errors.password ? 'true' : 'false'}
            />
            {member.errors.password ? (
              <span className="field__error">{member.errors.password}</span>
            ) : (
              <span className="field__hint">8 caractères minimum.</span>
            )}
          </div>
          <div>
            <button type="submit" className="btn btn--primary" disabled={member.processing}>
              <UserPlus size={16} /> Ajouter
            </button>
          </div>
        </div>
      </form>

      <form className="panel" onSubmit={changePassword} noValidate>
        <header className="section__header">
          <h2 className="section__title">Votre mot de passe</h2>
        </header>
        <div className="section__body" style={{ marginTop: 18 }}>
          <div className="field" style={{ maxWidth: 320 }}>
            <label className="field__label" htmlFor="current-password">
              Mot de passe actuel
            </label>
            <input
              id="current-password"
              type="password"
              autoComplete="current-password"
              className="field__input"
              value={password.data.currentPassword}
              onChange={(event) => password.setData('currentPassword', event.target.value)}
              aria-invalid={passwordErrors.currentPassword ? 'true' : 'false'}
            />
            {passwordErrors.currentPassword && (
              <span className="field__error">{passwordErrors.currentPassword}</span>
            )}
          </div>
          <div className="fields-row" style={{ maxWidth: 660 }}>
            <div className="field">
              <label className="field__label" htmlFor="new-password">
                Nouveau mot de passe
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                className="field__input"
                value={password.data.password}
                onChange={(event) => password.setData('password', event.target.value)}
                aria-invalid={passwordErrors.password ? 'true' : 'false'}
              />
              {passwordErrors.password && (
                <span className="field__error">{passwordErrors.password}</span>
              )}
            </div>
            <div className="field">
              <label className="field__label" htmlFor="confirm-password">
                Confirmation
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                className="field__input"
                value={password.data.passwordConfirmation}
                onChange={(event) => password.setData('passwordConfirmation', event.target.value)}
                aria-invalid={passwordErrors.passwordConfirmation ? 'true' : 'false'}
              />
              {passwordErrors.passwordConfirmation && (
                <span className="field__error">{passwordErrors.passwordConfirmation}</span>
              )}
            </div>
          </div>
          <div>
            <button type="submit" className="btn btn--secondary" disabled={password.processing}>
              Changer le mot de passe
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

TeamSettings.layout = [AppLayout, SettingsLayout]
