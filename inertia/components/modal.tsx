import { type ReactNode, useEffect, useRef } from 'react'

/**
 * A native dialog: focus is trapped, Escape closes it and the backdrop
 * click closes it too.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  wide = false,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  wide?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? 'modal--wide' : ''}`}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
    >
      {open && (
        <>
          <div className="modal__body">
            <h2 className="modal__title">{title}</h2>
            {description && <p className="modal__text">{description}</p>}
            {children && <div style={{ marginTop: 18 }}>{children}</div>}
          </div>
          {footer && <div className="modal__footer">{footer}</div>}
        </>
      )}
    </dialog>
  )
}
