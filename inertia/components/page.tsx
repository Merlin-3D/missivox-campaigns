import { type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'

/**
 * The frame for an app page: sets the document title and renders the page
 * heading, an optional description and optional actions (buttons, links)
 * aligned to the right. Pass `hideTitle` to only set the document title.
 */
export default function Page({
  title,
  hideTitle = false,
  description,
  actions,
  back,
  width,
  aside,
  children,
}: {
  title: string
  hideTitle?: boolean
  description?: ReactNode
  actions?: ReactNode
  back?: { href: string; label: string }
  width?: 'wide' | 'narrow'
  aside?: ReactNode
  children?: ReactNode
}) {
  const hasHeader = !hideTitle || description || actions

  return (
    <div className={`page ${width ? `page--${width}` : ''}`}>
      <Head title={title} />
      {back && (
        <Link href={back.href} className="page__back">
          <ArrowLeft size={15} /> {back.label}
        </Link>
      )}
      {hasHeader && (
        <header className="page__header">
          <div className="row" style={{ gap: 20, flexWrap: 'nowrap', alignItems: 'center' }}>
            {aside}
            <div>
              {!hideTitle && <h1 className="page__title">{title}</h1>}
              {description && <div className="page__description">{description}</div>}
            </div>
          </div>
          {actions && <div className="page__actions">{actions}</div>}
        </header>
      )}
      {children}
    </div>
  )
}
