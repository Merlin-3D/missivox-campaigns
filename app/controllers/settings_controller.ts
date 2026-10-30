import env from '#start/env'
import Workspace from '#models/workspace'
import WorkerStatus from '#services/worker_status'
import SettingsService from '#services/settings_service'
import WorkspaceMailer from '#services/workspace_mailer'
import { settingsValidator, smtpTestValidator, smtpValidator } from '#validators/settings'
import type { HttpContext } from '@adonisjs/core/http'

export default class SettingsController {
  async edit({ inertia, auth }: HttpContext) {
    const { workspaceId } = auth.user!
    const smtp = await SettingsService.smtp(workspaceId)

    return inertia.render('settings/general', {
      settings: await SettingsService.all(workspaceId),
      smtp: smtp
        ? {
            host: smtp.host,
            port: smtp.port,
            secure: smtp.secure,
            username: smtp.username,
            hasPassword: !!smtp.password,
          }
        : null,
      sharedServer: WorkspaceMailer.sharedServerAllowed()
        ? { host: env.get('SMTP_HOST'), port: env.get('SMTP_PORT') }
        : null,
      appUrl: env.get('APP_URL'),
      worker: await WorkerStatus.get(workspaceId),
    })
  }

  /**
   * The company name is also the name of the workspace.
   */
  async update({ request, response, session, auth }: HttpContext) {
    const { workspaceId } = auth.user!
    const values = await request.validateUsing(settingsValidator)
    await SettingsService.update(workspaceId, {
      ...values,
      replyTo: values.replyTo ?? null,
      companyAddress: values.companyAddress ?? null,
    })
    await Workspace.query().where('id', workspaceId).update({ name: values.companyName })

    session.flash('success', 'Réglages enregistrés.')
    return response.redirect().back()
  }

  async updateSmtp({ request, response, session, auth }: HttpContext) {
    const { host, port, secure, username, password } = await request.validateUsing(smtpValidator)
    await SettingsService.updateSmtp(auth.user!.workspaceId, {
      host,
      port,
      secure: secure ?? false,
      username: username ?? null,
      password: password ?? null,
    })

    session.flash(
      'success',
      'Serveur d’envoi enregistré. Envoyez-vous un email de test pour le vérifier.'
    )
    return response.redirect().back()
  }

  async destroySmtp({ response, session, auth }: HttpContext) {
    await SettingsService.updateSmtp(auth.user!.workspaceId, null)

    session.flash('success', 'Serveur d’envoi supprimé.')
    return response.redirect().back()
  }

  /**
   * Sends a short email to check the SMTP server of the workspace.
   */
  async testSmtp({ request, response, session, auth }: HttpContext) {
    const { workspaceId } = auth.user!
    const { email } = await request.validateUsing(smtpTestValidator)
    const mailer = await WorkspaceMailer.for(workspaceId)
    if (!mailer) {
      session.flash('error', 'Renseignez d’abord votre serveur d’envoi.')
      return response.redirect().back()
    }

    const settings = await SettingsService.all(workspaceId)
    try {
      await mailer.send((message) => {
        message
          .from(settings.senderEmail, settings.senderName)
          .to(email)
          .subject('Test de configuration SMTP')
          .text(
            'Bonne nouvelle : votre serveur SMTP fonctionne et les campagnes peuvent être envoyées.'
          )
      })
    } catch (error) {
      session.flash(
        'error',
        `Échec de l'envoi : ${error instanceof Error ? error.message : String(error)}`
      )
      return response.redirect().back()
    }

    await WorkerStatus.clearError(workspaceId)
    session.flash('success', `Email de test envoyé à ${email}.`)
    return response.redirect().back()
  }
}
