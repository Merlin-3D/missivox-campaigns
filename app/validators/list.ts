import vine from '@vinejs/vine'

export const listValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(120),
  description: vine.string().trim().maxLength(500).nullable().optional(),
})
