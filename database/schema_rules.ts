import { type ColumnInfo, type SchemaRules } from '@adonisjs/lucid/types/schema_generator'
import {
  CAMPAIGN_STATUSES,
  CONTACT_SOURCES,
  CONTACT_STATUSES,
  EDITORS,
  RECIPIENT_STATUSES,
  TRACKING_EVENT_TYPES,
} from './enums.js'

/**
 * SQLite stores booleans as 0/1 integers, so they are cast back when read.
 */
const boolean: ColumnInfo = {
  tsType: 'boolean',
  decorators: [{ name: '@column', args: { consume: (value: unknown) => Boolean(value) } }],
}

/**
 * JSON columns are stored as text in SQLite.
 */
function json(tsType: string): ColumnInfo {
  return {
    tsType,
    decorators: [
      {
        name: '@column',
        args: {
          prepare: (value: unknown) =>
            value === null || value === undefined ? null : JSON.stringify(value),
          consume: (value: unknown) => (typeof value === 'string' ? JSON.parse(value) : value),
        },
      },
    ],
  }
}

/**
 * Types an enum-like string column with its allowed values.
 */
function oneOf(values: readonly string[]): ColumnInfo {
  return {
    tsType: values.map((value) => `'${value}'`).join(' | '),
    decorators: [{ name: '@column' }],
  }
}

export default {
  types: {
    boolean,
  },
  tables: {
    settings: {
      columns: { value: json('any') },
    },
    worker_states: {
      columns: { value: json('any') },
    },
    contacts: {
      columns: {
        status: oneOf(CONTACT_STATUSES),
        source: oneOf(CONTACT_SOURCES),
        attributes: json('Record<string, string>'),
      },
    },
    templates: {
      columns: { editor: oneOf(EDITORS) },
    },
    campaigns: {
      columns: { editor: oneOf(EDITORS), status: oneOf(CAMPAIGN_STATUSES) },
    },
    campaign_recipients: {
      columns: { status: oneOf(RECIPIENT_STATUSES) },
    },
    tracking_events: {
      columns: { type: oneOf(TRACKING_EVENT_TYPES) },
    },
  },
} satisfies SchemaRules
