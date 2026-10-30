import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from '@adonisjs/inertia/react'
import { formatNumber } from '~/lib/format'

/**
 * Previous / next links that keep the current query string.
 */
export default function Pagination({
  currentPage,
  lastPage,
  total,
  noun,
}: {
  currentPage: number
  lastPage: number
  total: number
  noun: string
}) {
  if (lastPage <= 1) {
    return (
      <div className="pagination">
        <span>
          {formatNumber(total)} {noun}
        </span>
      </div>
    )
  }

  const hrefFor = (page: number) => {
    const params = new URLSearchParams(window.location.search)
    params.set('page', String(page))
    return `${window.location.pathname}?${params}`
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      <span>
        {formatNumber(total)} {noun}, page {currentPage} sur {lastPage}
      </span>
      <div className="row">
        {currentPage > 1 ? (
          <Link
            href={hrefFor(currentPage - 1)}
            className="btn btn--secondary btn--sm"
            preserveScroll
          >
            <ChevronLeft size={15} /> Précédente
          </Link>
        ) : (
          <button className="btn btn--secondary btn--sm" disabled>
            <ChevronLeft size={15} /> Précédente
          </button>
        )}
        {currentPage < lastPage ? (
          <Link
            href={hrefFor(currentPage + 1)}
            className="btn btn--secondary btn--sm"
            preserveScroll
          >
            Suivante <ChevronRight size={15} />
          </Link>
        ) : (
          <button className="btn btn--secondary btn--sm" disabled>
            Suivante <ChevronRight size={15} />
          </button>
        )}
      </div>
    </nav>
  )
}
