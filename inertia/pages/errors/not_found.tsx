import { Head } from '@inertiajs/react'
import PublicLayout from '~/layouts/public'

export default function NotFound() {
  return (
    <div className="public__card">
      <Head title="Page introuvable" />
      <div className="airmail" />
      <div className="public__body">
        <h1 className="public__title">Cette page n’existe pas</h1>
        <p className="public__text">
          L’adresse est peut-être mal saisie, ou l’élément a été supprimé.
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

NotFound.layout = [PublicLayout]
