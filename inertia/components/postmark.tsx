import { useId } from 'react'

/**
 * A round postmark, stamped on campaigns once they leave. The text runs
 * along the ring; the date sits in the middle between two bars.
 */
export default function Postmark({
  ring,
  date,
  tone = 'sent',
  size = 112,
}: {
  ring: string
  date: string
  tone?: 'sent' | 'cancelled' | 'pending'
  size?: number
}) {
  const id = useId()
  const path = `postmark-${id.replace(/:/g, '')}`

  return (
    <svg
      className={`postmark postmark--${tone}`}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={`${ring}, ${date}`}
    >
      <defs>
        <path id={path} d="M60 60 m-42 0 a42 42 0 1 1 84 0 a42 42 0 1 1 -84 0" />
      </defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="60" cy="60" r="32" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text
        fill="currentColor"
        fontFamily="var(--sans)"
        fontSize="11.5"
        fontWeight="650"
        letterSpacing="2.4"
      >
        <textPath href={`#${path}`} startOffset="50%" textAnchor="middle">
          {ring.toUpperCase()}
        </textPath>
      </text>
      <line x1="34" y1="51" x2="86" y2="51" stroke="currentColor" strokeWidth="1.5" />
      <line x1="34" y1="69" x2="86" y2="69" stroke="currentColor" strokeWidth="1.5" />
      <text
        x="60"
        y="64"
        textAnchor="middle"
        fill="currentColor"
        fontFamily="var(--serif)"
        fontSize="12"
        fontWeight="600"
      >
        {date}
      </text>
    </svg>
  )
}
