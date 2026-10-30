import vine from '@vinejs/vine'
import { EDITORS } from '#database/enums'

export const templateValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(120),
  subject: vine.string().trim().maxLength(255).nullable().optional(),
  editor: vine.enum(EDITORS),
  body: vine.string().maxLength(500_000),
})

/**
 * Content to preview, from the campaign or template editor.
 */
export const previewValidator = vine.create({
  subject: vine.string().maxLength(255).nullable().optional(),
  preheader: vine.string().maxLength(255).nullable().optional(),
  editor: vine.enum(EDITORS),
  body: vine.string().maxLength(500_000).nullable().optional(),
  contactId: vine.number().withoutDecimals().nullable().optional(),
})
