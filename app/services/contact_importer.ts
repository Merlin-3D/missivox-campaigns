import { parse } from 'csv-parse/sync'
import db from '@adonisjs/lucid/services/db'
import type { QueryClientContract, TransactionClientContract } from '@adonisjs/lucid/types/database'
import Contact from '#models/contact'
import { sqlDate } from '#services/sql_date'

/**
 * Accepted column headers for each contact field, compared without case,
 * accents, spaces or punctuation. Any other column becomes a custom
 * attribute.
 */
const HEADER_ALIASES: Record<string, string[]> = {
  email: ['email', 'mail', 'emailaddress', 'adresseemail', 'adressemail', 'courriel'],
  firstName: ['firstname', 'prenom', 'givenname'],
  lastName: ['lastname', 'nom', 'nomdefamille', 'surname', 'familyname'],
  company: ['company', 'entreprise', 'societe', 'organisation', 'organization'],
  phone: ['phone', 'telephone', 'tel', 'mobile', 'portable'],
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Lines reported in the summary are capped to keep the page light.
 */
const MAX_REPORTED_ERRORS = 50

export type ImportOptions = {
  workspaceId: number
  /**
   * Lists of the same workspace: callers check it.
   */
  listIds: number[]
  updateExisting: boolean
}

export type ImportSummary = {
  total: number
  created: number
  updated: number
  unchanged: number
  invalid: { line: number; value: string; reason: string }[]
}

type ParsedRow = {
  line: number
  email: string
  firstName: string | null
  lastName: string | null
  company: string | null
  phone: string | null
  attributes: Record<string, string>
}

function normalizeHeader(header: string) {
  return header
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

/**
 * Excel in French locales exports with semicolons: the delimiter is picked
 * from the header line.
 */
function detectDelimiter(firstLine: string) {
  const candidates = [',', ';', '\t']
  return candidates.reduce((best, candidate) =>
    firstLine.split(candidate).length > firstLine.split(best).length ? candidate : best
  )
}

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function parseContactsCsv(content: string) {
  const text = content.replace(/^\uFEFF/, '')
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''

  const records: string[][] = parse(text, {
    delimiter: detectDelimiter(firstLine),
    relax_column_count: true,
    skip_empty_lines: true,
    trim: true,
  })

  const [headers = [], ...lines] = records
  const fields = headers.map((header) => {
    const normalized = normalizeHeader(header)
    const field = Object.keys(HEADER_ALIASES).find((key) =>
      HEADER_ALIASES[key].includes(normalized)
    )
    return { field, attribute: header.trim() }
  })

  if (!fields.some(({ field }) => field === 'email')) {
    throw new Error(
      'Le fichier doit contenir une colonne « email ». Colonnes trouvées : ' +
        (headers.join(', ') || 'aucune')
    )
  }

  const rows: ParsedRow[] = []
  const invalid: ImportSummary['invalid'] = []

  lines.forEach((values, index) => {
    const line = index + 2
    const row: ParsedRow = {
      line,
      email: '',
      firstName: null,
      lastName: null,
      company: null,
      phone: null,
      attributes: {},
    }

    fields.forEach(({ field, attribute }, column) => {
      const value = values[column]
      if (field === 'email') row.email = Contact.normalize(value ?? '')
      else if (field) (row as any)[field] = emptyToNull(value)
      else if (attribute && emptyToNull(value)) row.attributes[attribute] = value.trim()
    })

    if (!EMAIL_PATTERN.test(row.email)) {
      invalid.push({ line, value: row.email || '(vide)', reason: 'Adresse email invalide' })
    } else {
      rows.push(row)
    }
  })

  return { rows, invalid }
}

/**
 * Adds contacts to lists, ignoring the memberships that already exist.
 */
export async function addContactsToLists(
  contactIds: number[],
  listIds: number[],
  client: QueryClientContract | TransactionClientContract = db.connection()
) {
  const now = sqlDate()
  for (const listId of listIds) {
    for (let i = 0; i < contactIds.length; i += 300) {
      await client
        .knexQuery()
        .table('contact_list')
        .insert(
          contactIds
            .slice(i, i + 300)
            .map((contactId) => ({ contact_id: contactId, list_id: listId, created_at: now }))
        )
        .onConflict(['contact_id', 'list_id'])
        .ignore()
    }
  }
}

/**
 * Imports contacts from a CSV file. Existing contacts (same email) are
 * updated only when asked, but they are always added to the chosen lists.
 * Unsubscribed or bounced contacts keep their status.
 */
export async function importContacts(
  content: string,
  options: ImportOptions
): Promise<ImportSummary> {
  const { rows, invalid } = parseContactsCsv(content)

  /**
   * The last occurrence of an email wins when the file has duplicates.
   */
  const byEmail = new Map(rows.map((row) => [row.email, row]))
  const summary: ImportSummary = {
    total: rows.length + invalid.length,
    created: 0,
    updated: 0,
    unchanged: rows.length - byEmail.size,
    invalid: invalid.slice(0, MAX_REPORTED_ERRORS),
  }

  await db.transaction(async (trx) => {
    const existing = new Map<string, Contact>()
    const emails = [...byEmail.keys()]

    for (let i = 0; i < emails.length; i += 500) {
      const chunk = await Contact.query({ client: trx })
        .where('workspace_id', options.workspaceId)
        .whereIn('email', emails.slice(i, i + 500))
      chunk.forEach((contact) => existing.set(contact.email, contact))
    }

    const contactIds: number[] = []

    for (const row of byEmail.values()) {
      const { line, email, attributes, ...fields } = row
      let contact = existing.get(email)

      if (!contact) {
        contact = await Contact.create(
          {
            workspaceId: options.workspaceId,
            email,
            ...fields,
            attributes: Object.keys(attributes).length ? attributes : null,
            status: 'subscribed',
            source: 'import',
          },
          { client: trx }
        )
        summary.created++
      } else if (options.updateExisting) {
        contact.useTransaction(trx)
        for (const [key, value] of Object.entries(fields)) {
          if (value !== null) (contact as any)[key] = value
        }
        if (Object.keys(attributes).length) {
          contact.attributes = { ...(contact.attributes ?? {}), ...attributes }
        }
        if (contact.$isDirty) {
          await contact.save()
          summary.updated++
        } else {
          summary.unchanged++
        }
      } else {
        summary.unchanged++
      }

      contactIds.push(contact.id)
    }

    await addContactsToLists(contactIds, options.listIds, trx)
  })

  return summary
}
