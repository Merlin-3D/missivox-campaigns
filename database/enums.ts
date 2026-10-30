/**
 * Allowed values of the string columns used as enums. They are shared by
 * the schema rules (to type the generated models), the validators and the
 * services, so a value only ever needs to be added here.
 */
export const CONTACT_STATUSES = ['subscribed', 'unsubscribed', 'bounced'] as const
export const CONTACT_SOURCES = ['manual', 'import'] as const
export const EDITORS = ['visual', 'html'] as const
export const CAMPAIGN_STATUSES = [
  'draft',
  'scheduled',
  'sending',
  'paused',
  'sent',
  'cancelled',
] as const
export const RECIPIENT_STATUSES = ['pending', 'processing', 'sent', 'failed', 'skipped'] as const
export const TRACKING_EVENT_TYPES = ['open', 'click', 'unsubscribe'] as const

export type ContactStatus = (typeof CONTACT_STATUSES)[number]
export type ContactSource = (typeof CONTACT_SOURCES)[number]
export type Editor = (typeof EDITORS)[number]
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number]
export type RecipientStatus = (typeof RECIPIENT_STATUSES)[number]
export type TrackingEventType = (typeof TRACKING_EVENT_TYPES)[number]
