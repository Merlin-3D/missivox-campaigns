import { TriangleAlert } from 'lucide-react'
import type { WorkerHealth } from '~/lib/server_types'

/**
 * Explains why emails are not leaving, when the sending worker is stopped
 * or the SMTP server fails. Only shown when something is waiting to go.
 */
export default function WorkerAlert({
  worker,
  hasPendingEmails,
}: {
  worker: WorkerHealth
  hasPendingEmails: boolean
}) {
  if (!hasPendingEmails) return null

  if (worker.error) {
    return (
      <div className="alert alert--danger" style={{ marginBottom: 20 }}>
        <TriangleAlert size={16} />
        <div>
          <strong>Les emails ne partent pas.</strong> {worker.error.message} Vérifiez les paramètres
          SMTP dans le fichier .env, puis testez-les depuis les réglages.
        </div>
      </div>
    )
  }

  if (!worker.alive) {
    return (
      <div className="alert alert--warn" style={{ marginBottom: 20 }}>
        <TriangleAlert size={16} />
        <div>
          <strong>Le service d’envoi est arrêté.</strong> Des emails attendent d’être envoyés.
          Démarrez-le avec <code className="mono">node ace campaigns:work</code>, ou passez{' '}
          <code className="mono">CAMPAIGN_WORKER=true</code> pour qu’il tourne avec le serveur.
        </div>
      </div>
    )
  }

  return null
}
