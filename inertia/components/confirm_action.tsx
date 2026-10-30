import { type ReactNode, useState } from 'react'
import { router } from '@inertiajs/react'
import Modal from '~/components/modal'

/**
 * A button that asks for confirmation, then sends a request to the given
 * URL. Used for destructive or irreversible actions.
 */
export default function ConfirmAction({
  url,
  method = 'post',
  title,
  description,
  confirmLabel,
  danger = false,
  className = 'btn btn--secondary btn--sm',
  children,
}: {
  url: string
  method?: 'post' | 'put' | 'delete'
  title: string
  description: ReactNode
  confirmLabel: string
  danger?: boolean
  className?: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [processing, setProcessing] = useState(false)

  const confirm = () => {
    router.visit(url, {
      method,
      preserveScroll: true,
      onStart: () => setProcessing(true),
      onFinish: () => {
        setProcessing(false)
        setOpen(false)
      },
    })
  }

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        description={description}
        footer={
          <>
            <button type="button" className="btn btn--secondary" onClick={() => setOpen(false)}>
              Annuler
            </button>
            <button
              type="button"
              className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`}
              onClick={confirm}
              disabled={processing}
              autoFocus
            >
              {processing ? 'Un instant…' : confirmLabel}
            </button>
          </>
        }
      />
    </>
  )
}
