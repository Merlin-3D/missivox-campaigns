import AuthLayout from '~/layouts/auth'
import { Head } from '@inertiajs/react'
import { Form, Link } from '@adonisjs/inertia/react'

export default function Signup() {
  return (
    <>
      <Head title="Créer un compte" />
      <h1 className="auth__title">Créer votre compte</h1>
      <p className="auth__sub">
        Vous obtenez votre propre espace : vos contacts et vos campagnes ne sont visibles que de
        vous et des personnes que vous y ajoutez.
      </p>

      <Form route="new_account.store">
        {({ errors, processing }) => (
          <div className="auth__form">
            <div className="field">
              <label className="field__label" htmlFor="companyName">
                Nom de l’entreprise
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                className="field__input"
                autoComplete="organization"
                placeholder="Boutique Martin"
                aria-invalid={errors.companyName ? 'true' : 'false'}
                autoFocus
              />
              {errors.companyName ? (
                <span className="field__error">{errors.companyName}</span>
              ) : (
                <span className="field__hint">Affiché comme expéditeur de vos emails.</span>
              )}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="fullName">
                Votre nom <span className="field__optional">(facultatif)</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="field__input"
                autoComplete="name"
                placeholder="Camille Martin"
                aria-invalid={errors.fullName ? 'true' : 'false'}
              />
              {errors.fullName && <span className="field__error">{errors.fullName}</span>}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="field__input"
                autoComplete="email"
                placeholder="vous@entreprise.fr"
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && <span className="field__error">{errors.email}</span>}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="password">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="field__input"
                autoComplete="new-password"
                aria-invalid={errors.password ? 'true' : 'false'}
              />
              {errors.password ? (
                <span className="field__error">{errors.password}</span>
              ) : (
                <span className="field__hint">8 caractères minimum.</span>
              )}
            </div>

            <div className="field">
              <label className="field__label" htmlFor="passwordConfirmation">
                Confirmez le mot de passe
              </label>
              <input
                id="passwordConfirmation"
                name="passwordConfirmation"
                type="password"
                className="field__input"
                autoComplete="new-password"
                aria-invalid={errors.passwordConfirmation ? 'true' : 'false'}
              />
              {errors.passwordConfirmation && (
                <span className="field__error">{errors.passwordConfirmation}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--block"
              disabled={processing}
              style={{ marginTop: 4 }}
            >
              {processing ? 'Création…' : 'Créer mon compte'}
            </button>
          </div>
        )}
      </Form>

      <p className="auth__foot">
        Déjà un compte ? <Link route="session.create">Se connecter</Link>
      </p>
    </>
  )
}

Signup.layout = [AuthLayout]
