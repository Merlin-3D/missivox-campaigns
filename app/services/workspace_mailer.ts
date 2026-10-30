import env from '#start/env'
import { Mailer } from '@adonisjs/mail'
import mail from '@adonisjs/mail/services/main'
import emitter from '@adonisjs/core/services/emitter'
import { SMTPTransport } from '@adonisjs/mail/transports/smtp'
import SettingsService, { type SmtpSettings } from '#services/settings_service'

export type WorkspaceMailerContract = Pick<Mailer<any>, 'send'>

/**
 * Picks the SMTP server that sends the emails of a workspace: its own,
 * or the server of the instance when SMTP_SHARED allows it.
 */
export default class WorkspaceMailer {
  static #mailers = new Map<number, { signature: string; mailer: Mailer<SMTPTransport> }>()

  static sharedServerAllowed() {
    return env.get('SMTP_SHARED', false)
  }

  /**
   * The mailer of the workspace, or null when it has no way to send.
   */
  static async for(workspaceId: number): Promise<WorkspaceMailerContract | null> {
    const smtp = await SettingsService.smtp(workspaceId)
    if (smtp) return this.#own(workspaceId, smtp)
    return this.sharedServerAllowed() ? mail.use() : null
  }

  static async canSend(workspaceId: number) {
    return this.sharedServerAllowed() || !!(await SettingsService.smtp(workspaceId))
  }

  /**
   * Transports keep their connection open, so one is reused until the
   * workspace changes its server.
   */
  static #own(workspaceId: number, smtp: SmtpSettings) {
    const signature = JSON.stringify(smtp)
    const cached = this.#mailers.get(workspaceId)
    if (cached?.signature === signature) return cached.mailer

    void cached?.mailer.close()
    const mailer = new Mailer(
      `workspace-${workspaceId}`,
      new SMTPTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
        auth: smtp.username
          ? { type: 'login', user: smtp.username, pass: smtp.password ?? '' }
          : undefined,
      }),
      emitter,
      mail.config
    )
    this.#mailers.set(workspaceId, { signature, mailer })
    return mailer
  }
}
