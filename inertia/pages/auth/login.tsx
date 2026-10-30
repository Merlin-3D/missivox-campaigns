import AuthLayout from '~/layouts/auth'
import { Head } from '@inertiajs/react'
import { Form, Link } from '@adonisjs/inertia/react'

export default function Login() {
  return (
    <>
      <Head title="Connexion" />
      <h1 className="auth__title">Bon retour</h1>
      <p className="auth__sub">Connectez-vous pour retrouver vos campagnes.</p>

      <Form route="session.store">
        {({ errors, processing }) => (
          <div className="auth__form">
            <div className="field">
              <label className="field__label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="field__input"
                autoComplete="username"
                placeholder="vous@entreprise.fr"
                aria-invalid={errors.email ? 'true' : 'false'}
                autoFocus
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
                autoComplete="current-password"
                aria-invalid={errors.password ? 'true' : 'false'}
              />
              {errors.password && <span className="field__error">{errors.password}</span>}
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--block"
              disabled={processing}
              style={{ marginTop: 4 }}
            >
              {processing ? 'Connexion…' : 'Se connecter'}
            </button>
          </div>
        )}
      </Form>

      <p className="auth__foot">
        Pas encore de compte ? <Link route="new_account.create">Créer un compte</Link>
      </p>
    </>
  )
}

Login.layout = [AuthLayout]
