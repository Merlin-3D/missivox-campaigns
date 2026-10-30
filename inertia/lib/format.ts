const LOCALE = 'fr-FR'

const dateFormat = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})
const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
const timeFormat = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' })
const numberFormat = new Intl.NumberFormat(LOCALE)
const relativeFormat = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' })

export function formatDate(value: string | null | undefined) {
  return value ? dateFormat.format(new Date(value)) : '—'
}

export function formatDateTime(value: string | null | undefined) {
  return value ? dateTimeFormat.format(new Date(value)) : '—'
}

export function formatTime(value: string | null | undefined) {
  return value ? timeFormat.format(new Date(value)) : '—'
}

export function formatNumber(value: number) {
  return numberFormat.format(value)
}

export function formatPercent(value: number) {
  return `${numberFormat.format(value)} %`
}

/**
 * "il y a 5 minutes", "dans 2 jours"...
 */
export function formatRelative(value: string | null | undefined) {
  if (!value) return '—'
  const seconds = (new Date(value).getTime() - Date.now()) / 1000
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relativeFormat.format(Math.round(seconds / size), unit)
  }
  return relativeFormat.format(Math.round(seconds), 'second')
}

export function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return `${formatNumber(count)} ${count > 1 ? pluralForm : singular}`
}

/**
 * Value for a datetime-local input, in the browser's time zone.
 */
export function toDateTimeLocal(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
