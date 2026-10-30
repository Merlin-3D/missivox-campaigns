import { Head } from '@inertiajs/react'
import PublicLayout from '~/layouts/public'

export default function ServerError() {
  return (
    <div className="public__card">
      <Head title="Erreur" />
      <div className="airmail" />
      <div className="public__body">
        <h1 className="public__title">Une erreur est survenue</h1>
        <p className="public__text">
          Le serveur n’a pas pu traiter la demande. Réessayez dans un instant ; si le problème
          continue, consultez les journaux du serveur.
        </p>
        <div>
          <a href="/dashboard" className="btn btn--primary">
            Retour au tableau de bord
          </a>
        </div>
      </div>
    </div>
  )
}

ServerError.layout = [PublicLayout]
