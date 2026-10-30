import vine from '@vinejs/vine'
import { EDITORS } from '#database/enums'

const sender = {
  fromName: vine.string().trim().minLength(1).maxLength(120),
  fromEmail: vine.string().trim().email().maxLength(254),
  replyTo: vine.string().trim().email().maxLength(254).nullable().optional(),
}

export const createCampaignValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(150),
  subject: vine.string().trim().maxLength(255).nullable().optional(),
  templateId: vine.number().withoutDecimals().nullable().optional(),
  listIds: vine.array(vine.number().withoutDecimals()).optional(),
  ...sender,
})

export const updateCampaignValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(150),
  subject: vine.string().trim().maxLength(255),
  preheader: vine.string().trim().maxLength(255).nullable().optional(),
  ...sender,
  editor: vine.enum(EDITORS),
  body: vine.string().maxLength(500_000).nullable().optional(),
  listIds: vine.array(vine.number().withoutDecimals()),
  trackOpens: vine.boolean(),
  trackClicks: vine.boolean(),
})

export const scheduleCampaignValidator = vine.create({
  /**
   * ISO date with time zone, sent by the browser. Missing means now.
   */
  sendAt: vine
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)
    .nullable()
    .optional(),
})

export const testCampaignValidator = vine.create({
  emails: vine.string().trim().minLength(3).maxLength(1000),
})

export const recipientFiltersValidator = vine.create({
  status: vine
    .enum(['sent', 'failed', 'pending', 'skipped', 'opened', 'clicked', 'unsubscribed'])
    .nullable()
    .optional(),
  q: vine.string().trim().maxLength(200).nullable().optional(),
  page: vine.number().withoutDecimals().min(1).nullable().optional(),
})
