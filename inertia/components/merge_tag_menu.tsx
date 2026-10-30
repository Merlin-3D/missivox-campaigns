import { useEffect, useRef, useState } from 'react'
import { Braces } from 'lucide-react'
import { MERGE_TAGS } from '~/lib/labels'

/**
 * Dropdown listing the personalisation tags. Picking one calls `onPick`
 * with the tag ready to insert, like `{{ first_name }}`.
 */
export default function MergeTagMenu({
  onPick,
  align = 'left',
  compact = false,
}: {
  onPick: (tag: string) => void
  align?: 'left' | 'right'
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  return (
    <div className="menu" ref={ref}>
      <button
        type="button"
        className={compact ? 'editor__btn' : 'btn btn--ghost btn--sm'}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        title="Insérer une variable"
      >
        <Braces size={15} />
        {!compact && 'Variable'}
        {compact && <span style={{ marginLeft: 4 }}>Variable</span>}
      </button>
      {open && (
        <div className={`menu__list ${align === 'right' ? 'menu__list--right' : ''}`} role="menu">
          {MERGE_TAGS.map(({ tag, label }) => (
            <button
              key={tag}
              type="button"
              role="menuitem"
              className="menu__item"
              onClick={() => {
                onPick(`{{ ${tag} }}`)
                setOpen(false)
              }}
            >
              <span>{label}</span>
              <code>{tag}</code>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
