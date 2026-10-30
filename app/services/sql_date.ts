import { DateTime } from 'luxon'

/**
 * Formats a date the way Lucid stores it in SQLite, for raw queries.
 */
export function sqlDate(date: DateTime = DateTime.now()) {
  return date.toLocal().toFormat('yyyy-MM-dd HH:mm:ss')
}
