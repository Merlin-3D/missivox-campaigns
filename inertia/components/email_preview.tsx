import { useEffect, useState } from 'react'
import { ExternalLink, Monitor, Smartphone } from 'lucide-react'
import { urlFor } from '~/client'
import { postJson } from '~/lib/http'
import type { EditorMode } from '~/components/email_editor'

type Rendered = { subject: string; html: string; text: string }

/**
 * Live preview of the email being written: the inbox line (sender,
 * subject, preview text) and the message itself, rendered by the server
 * exactly as it will be sent, with sample contact data.
 */
export default function EmailPreview({
  fromName,
  subject,
  preheader,
  editor,
  body,
  openUrl,
}: {
  fromName: string
  subject: string
  preheader: string | null
  editor: EditorMode
  body: string
  openUrl?: string
}) {
  const [rendered, setRendered] = useState<Rendered | null>(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const result = await postJson<Rendered>(
          urlFor('previews.render'),
          { subject, preheader, editor, body },
          controller.signal
        )
        setRendered(result)
        setFailed(false)
      } catch (error) {
        if (!controller.signal.aborted) setFailed(true)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 450)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [subject, preheader, editor, body])

  const initial = (fromName.trim()[0] ?? '?').toUpperCase()

  return (
    <div className="inbox">
      <div className="inbox__head">
        <div className="tabs" role="tablist" aria-label="Format d'aperçu">
          <button
            type="button"
            role="tab"
            className="tabs__tab"
            aria-selected={device === 'desktop'}
            onClick={() => setDevice('desktop')}
          >
            <Monitor size={14} /> Ordinateur
          </button>
          <button
            type="button"
            role="tab"
            className="tabs__tab"
            aria-selected={device === 'mobile'}
            onClick={() => setDevice('mobile')}
          >
            <Smartphone size={14} /> Mobile
          </button>
        </div>
        {openUrl && (
          <a href={openUrl} target="_blank" rel="noreferrer" className="btn btn--ghost btn--sm">
            <ExternalLink size={14} /> Plein écran
          </a>
        )}
      </div>

      <div className="inbox__row">
        <span className="inbox__avatar" aria-hidden="true">
          {initial}
        </span>
        <div style={{ minWidth: 0 }}>
          <div className="inbox__from truncate">{fromName || 'Expéditeur'}</div>
          <div className="inbox__subject truncate">
            {rendered?.subject || subject || <span className="muted">(sans objet)</span>}
          </div>
          {preheader && <div className="inbox__preheader truncate">{preheader}</div>}
        </div>
      </div>

      <div className={`inbox__stage ${device === 'mobile' ? 'inbox__stage--mobile' : ''}`}>
        {failed && !rendered ? (
          <div className="alert alert--danger" style={{ margin: 16 }}>
            L’aperçu n’a pas pu être généré. Vérifiez votre connexion puis modifiez le contenu pour
            réessayer.
          </div>
        ) : (
          <iframe
            title="Aperçu de l'email"
            className={`inbox__frame ${loading ? 'inbox__frame--loading' : ''}`}
            srcDoc={rendered?.html ?? ''}
            sandbox="allow-same-origin allow-popups"
          />
        )}
      </div>
      <p className="field__hint" style={{ padding: '10px 14px' }}>
        Aperçu avec un contact fictif, Camille Martin.
      </p>
    </div>
  )
}
