import { Head } from '@inertiajs/react'
import { Form } from '@adonisjs/inertia/react'
import PublicLayout from '~/layouts/public'
import { type InertiaProps } from '~/types'

type Props = InertiaProps<{
  token: string
  email: string
  companyName: string
  unsubscribed: boolean
  preview: boolean
}>

export default function Unsubscribe({ token, email, companyName, unsubscribed, preview }: Props) {
  return (
    <div style={{ width: 'min(480px, 100%)' }}>
      <Head title="Désinscription" />
      <div className="public__card">
        <div className="airmail" />
        {unsubscribed ? (
          <div className="public__body">
            <h1 className="public__title">Vous êtes désinscrit(e)</h1>
            <p className="public__text">
              L’adresse <strong>{email}</strong> ne recevra plus les emails de {companyName}.
            </p>
            <Form route="unsubscribe.destroy" routeParams={{ token }}>
              {({ processing }) => (
                <p className="public__text muted" style={{ fontSize: 14 }}>
                  C’était une erreur ?{' '}
                  <button type="submit" className="il" disabled={processing}>
                    Me réinscrire
                  </button>
                </p>
              )}
            </Form>
          </div>
        ) : (
          <div className="public__body">
            <h1 className="public__title">Ne plus recevoir nos emails</h1>
            <p className="public__text">
              Confirmez que l’adresse <strong>{email}</strong> ne doit plus recevoir les emails de{' '}
              {companyName}.
            </p>
            {preview ? (
              <div className="alert alert--info">
                Ce lien vient d’un email de test : aucune adresse ne sera désinscrite.
              </div>
            ) : (
              <Form route="unsubscribe.store" routeParams={{ token }}>
                {({ processing }) => (
                  <button type="submit" className="btn btn--primary" disabled={processing}>
                    {processing ? 'Un instant…' : 'Me désinscrire'}
                  </button>
                )}
              </Form>
            )}
          </div>
        )}
      </div>
      <p className="public__foot" style={{ textAlign: 'center' }}>
        Envoyé avec Missivox pour {companyName}
      </p>
    </div>
  )
}

Unsubscribe.layout = [PublicLayout]
