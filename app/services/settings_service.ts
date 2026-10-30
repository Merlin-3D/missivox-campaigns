import env from '#start/env'
import encryption from '@adonisjs/core/services/encryption'
import Setting from '#models/setting'

export type AppSettings = {
  senderName: string
  senderEmail: string
  replyTo: string | null
  companyName: string
  companyAddress: string | null
  sendRatePerMinute: number
}

/**
 * The SMTP server of a workspace. The password is stored encrypted with
 * the APP_KEY and only decrypted to send.
 */
export type SmtpSettings = {
  host: string
  port: number
  secure: boolean
  username: string | null
  password: string | null
}

const SMTP_KEY = 'smtp'

function defaults(): AppSettings {
  return {
    senderName: env.get('MAIL_FROM_NAME'),
    senderEmail: env.get('MAIL_FROM_ADDRESS'),
    replyTo: null,
    companyName: env.get('MAIL_FROM_NAME'),
    companyAddress: null,
    sendRatePerMinute: 60,
  }
}

/**
 * Settings of a workspace, editable from the interface. Values are read
 * from the database on every call, so the web server and a separate
 * worker process always agree.
 */
export default class SettingsService {
  static async all(workspaceId: number): Promise<AppSettings> {
    const values = defaults()
    const rows = await Setting.query()
      .where('workspace_id', workspaceId)
      .whereIn('key', Object.keys(values))

    for (const row of rows) {
      if (row.value !== null && row.value !== undefined) {
        ;(values as Record<string, unknown>)[row.key] = row.value
      }
    }

    return values
  }

  static async update(workspaceId: number, values: Partial<AppSettings>) {
    const entries = Object.entries(values).filter(([, value]) => value !== undefined)
    await Setting.updateOrCreateMany(
      ['workspaceId', 'key'],
      entries.map(([key, value]) => ({ workspaceId, key, value }))
    )
  }

  /**
   * The SMTP server of the workspace, or null when none is configured.
   */
  static async smtp(workspaceId: number): Promise<SmtpSettings | null> {
    const row = await Setting.query()
      .where('workspace_id', workspaceId)
      .where('key', SMTP_KEY)
      .first()
    if (!row?.value?.host) return null

    return {
      ...row.value,
      password: row.value.password ? encryption.decrypt<string>(row.value.password) : null,
    }
  }

  /**
   * Saves the SMTP server. A null password keeps the one already stored,
   * so the form never has to send it back.
   */
  static async updateSmtp(workspaceId: number, smtp: SmtpSettings | null) {
    if (!smtp) {
      await Setting.query().where('workspace_id', workspaceId).where('key', SMTP_KEY).delete()
      return
    }

    const current = await this.smtp(workspaceId)
    const password = smtp.password ?? current?.password ?? null

    await Setting.updateOrCreate(
      { workspaceId, key: SMTP_KEY },
      { value: { ...smtp, password: password ? encryption.encrypt(password) : null } }
    )
  }
}
