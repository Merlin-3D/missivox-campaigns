import { Link } from '@adonisjs/inertia/react'

/**
 * The Missivox mark: a folded letter whose flap forms an M.
 */
export function LogoMark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="2" y="6" width="28" height="20" rx="3.5" fill="currentColor" />
      <path
        d="M6 11l5.2 5.6L16 11.5l4.8 5.1L26 11"
        stroke="var(--card)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M2 22.5h28" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 3" />
    </svg>
  )
}

export default function Logo({ withName = true }: { withName?: boolean }) {
  return (
    <Link route="dashboard" className="brand" aria-label="Missivox, tableau de bord">
      <LogoMark />
      {withName && <span className="brand__name">Missivox</span>}
    </Link>
  )
}
