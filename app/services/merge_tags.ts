import type Contact from '#models/contact'

/**
 * Values available to the `{{ tag }}` placeholders of an email. Custom
 * contact attributes are exposed as `attr.<name>`.
 */
export type MergeData = Record<string, string | null | undefined>

/**
 * Tags every email can use, with a sample value for previews.
 */
export const BUILTIN_TAGS = {
  first_name: 'Prénom du contact',
  last_name: 'Nom du contact',
  full_name: 'Nom complet',
  email: 'Adresse email',
  company: 'Entreprise',
  phone: 'Téléphone',
  unsubscribe_url: 'Lien de désinscription',
  web_version_url: 'Lien « voir en ligne »',
} as const

export const SAMPLE_DATA: MergeData = {
  first_name: 'Camille',
  last_name: 'Martin',
  full_name: 'Camille Martin',
  email: 'camille.martin@example.com',
  company: 'Exemple SARL',
  phone: '+33 6 12 34 56 78',
}

/**
 * `{{ first_name }}`, `{{ attr.city }}` or `{{ first_name | "cher client" }}`
 * to use a fallback when the value is empty. The quotes of the fallback may
 * arrive HTML-encoded from the visual editor.
 */
const TAG_PATTERN =
  /\{\{\s*([a-zA-Z_][\w.-]*)\s*(?:\|\s*(?:"([^"]*)"|'([^']*)'|&quot;(.*?)&quot;))?\s*\}\}/g

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char])
}

/**
 * Replaces the placeholders with the given data. Values are HTML-escaped
 * by default; pass `escape: false` for subjects and plain text, or a
 * function (like encodeURIComponent) for other contexts. Unknown or empty
 * values use the fallback, or nothing, so a raw `{{ tag }}` never reaches
 * a recipient.
 */
export function renderMergeTags(
  input: string,
  data: MergeData,
  options: { escape?: boolean | ((value: string) => string) } = {}
) {
  const escape =
    typeof options.escape === 'function'
      ? options.escape
      : options.escape === false
        ? (value: string) => value
        : escapeHtml

  return input.replace(
    TAG_PATTERN,
    (_, key: string, doubleQuoted?: string, singleQuoted?: string, encoded?: string) => {
      const value = data[key]
      const fallback = doubleQuoted ?? singleQuoted ?? encoded ?? ''
      const resolved = value === null || value === undefined || value === '' ? fallback : value
      return escape(resolved)
    }
  )
}

/**
 * Lists the tags used in a text that are neither built-in nor custom
 * attributes, to warn about typos before sending.
 */
export function findUnknownTags(input: string) {
  const unknown = new Set<string>()
  for (const [, key] of input.matchAll(TAG_PATTERN)) {
    if (!(key in BUILTIN_TAGS) && !key.startsWith('attr.')) {
      unknown.add(key)
    }
  }
  return [...unknown]
}

/**
 * Builds the merge data of a contact.
 */
export function contactMergeData(contact: Contact): MergeData {
  const data: MergeData = {
    first_name: contact.firstName,
    last_name: contact.lastName,
    full_name: contact.fullName,
    email: contact.email,
    company: contact.company,
    phone: contact.phone,
  }

  for (const [name, value] of Object.entries(contact.attributes ?? {})) {
    data[`attr.${name}`] = value
  }

  return data
}
