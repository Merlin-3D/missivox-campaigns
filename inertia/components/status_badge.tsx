import { CAMPAIGN_STATUS, CONTACT_STATUS, RECIPIENT_STATUS } from '~/lib/labels'

const SOURCES = {
  campaign: CAMPAIGN_STATUS,
  contact: CONTACT_STATUS,
  recipient: RECIPIENT_STATUS,
}

export default function StatusBadge({
  kind,
  status,
}: {
  kind: keyof typeof SOURCES
  status: string
}) {
  const entry = SOURCES[kind][status] ?? { label: status, tone: 'neutral' }
  const classes = ['badge', `badge--${entry.tone}`, entry.live ? 'badge--live' : '']
  return <span className={classes.join(' ')}>{entry.label}</span>
}
