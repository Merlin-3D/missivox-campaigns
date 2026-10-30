export type BadgeTone = 'neutral' | 'ok' | 'warn' | 'info' | 'danger'

type Label = { label: string; tone: BadgeTone; live?: boolean }

export const CAMPAIGN_STATUS: Record<string, Label> = {
  draft: { label: 'Brouillon', tone: 'neutral' },
  scheduled: { label: 'Programmée', tone: 'warn' },
  sending: { label: 'En cours d’envoi', tone: 'info', live: true },
  paused: { label: 'En pause', tone: 'warn' },
  sent: { label: 'Envoyée', tone: 'ok' },
  cancelled: { label: 'Annulée', tone: 'danger' },
}

export const CONTACT_STATUS: Record<string, Label> = {
  subscribed: { label: 'Inscrit', tone: 'ok' },
  unsubscribed: { label: 'Désinscrit', tone: 'neutral' },
  bounced: { label: 'Adresse invalide', tone: 'danger' },
}

export const RECIPIENT_STATUS: Record<string, Label> = {
  pending: { label: 'En attente', tone: 'neutral' },
  processing: { label: 'En cours', tone: 'info', live: true },
  sent: { label: 'Envoyé', tone: 'ok' },
  failed: { label: 'Échec', tone: 'danger' },
  skipped: { label: 'Non envoyé', tone: 'neutral' },
}

export const CONTACT_SOURCE: Record<string, string> = {
  manual: 'Ajout manuel',
  import: 'Import CSV',
}

/**
 * Personalisation tags offered by the editors.
 */
export const MERGE_TAGS = [
  { tag: 'first_name', label: 'Prénom' },
  { tag: 'last_name', label: 'Nom' },
  { tag: 'full_name', label: 'Nom complet' },
  { tag: 'email', label: 'Adresse email' },
  { tag: 'company', label: 'Entreprise' },
  { tag: 'phone', label: 'Téléphone' },
  { tag: 'unsubscribe_url', label: 'Lien de désinscription' },
  { tag: 'web_version_url', label: 'Lien « voir en ligne »' },
]
