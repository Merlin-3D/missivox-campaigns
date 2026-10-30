import vine from '@vinejs/vine'

export const settingsValidator = vine.create({
  senderName: vine.string().trim().minLength(1).maxLength(120),
  senderEmail: vine.string().trim().email().maxLength(254),
  replyTo: vine.string().trim().email().maxLength(254).nullable().optional(),
  companyName: vine.string().trim().minLength(1).maxLength(150),
  companyAddress: vine.string().trim().maxLength(500).nullable().optional(),
  sendRatePerMinute: vine.number().withoutDecimals().min(1).max(3000),
})

/**
 * An empty password keeps the one already saved.
 */
export const smtpValidator = vine.create({
  host: vine
    .string()
    .trim()
    .maxLength(253)
    .regex(/^[a-zA-Z0-9.-]+$/),
  port: vine.number().withoutDecimals().min(1).max(65535),
  secure: vine.boolean().optional(),
  username: vine.string().trim().maxLength(254).nullable().optional(),
  password: vine.string().maxLength(500).nullable().optional(),
})

export const smtpTestValidator = vine.create({
  email: vine.string().trim().email(),
})

export const teamMemberValidator = vine.create({
  fullName: vine.string().trim().maxLength(120).nullable().optional(),
  email: vine.string().trim().toLowerCase().email().maxLength(254).unique({
    table: 'users',
    column: 'email',
  }),
  password: vine.string().minLength(8).maxLength(64),
})

export const passwordValidator = vine.create({
  currentPassword: vine.string(),
  password: vine.string().minLength(8).maxLength(64),
  passwordConfirmation: vine.string().sameAs('password'),
})
