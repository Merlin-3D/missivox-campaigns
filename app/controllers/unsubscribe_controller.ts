import Campaign from '#models/campaign'
import TrackingService from '#services/tracking_service'
import SettingsService from '#services/settings_service'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Hides most of the address: the page is reachable by anyone who has the
 * link, so it must not leak the full email.
 */
function maskEmail(email: string) {
  const [name, domain] = email.split('@')
  const visible = name.slice(0, Math.min(2, name.length))
  return `${visible}${'•'.repeat(Math.max(1, name.length - visible.length))}@${domain}`
}

export default class UnsubscribeController {
  async show({ params, inertia, response, auth }: HttpContext) {
    /**
     * Reached from a test email: the sender is usually signed in, which
     * tells whose page to show.
     */
    if (params.token === 'preview') {
      const settings = auth.user ? await SettingsService.all(auth.user.workspaceId) : null
      return inertia.render('public/unsubscribe', {
        token: 'preview',
        email: 'camille.martin@example.com',
        companyName: settings?.companyName ?? 'votre entreprise',
        unsubscribed: false,
        preview: true,
      })
    }

    const recipient = await TrackingService.findRecipient(params.token)
    if (!recipient) {
      response.status(404)
      return inertia.render('public/message', {
        title: 'Lien invalide',
        message: "Ce lien de désinscription n'est pas valide. Il a peut-être été mal copié.",
      })
    }

    const campaign = await Campaign.findOrFail(recipient.campaignId)
    const settings = await SettingsService.all(campaign.workspaceId)

    return inertia.render('public/unsubscribe', {
      token: recipient.token,
      email: maskEmail(recipient.email),
      companyName: settings.companyName,
      unsubscribed: !!recipient.unsubscribedAt,
      preview: false,
    })
  }

  /**
   * Called by the confirmation button, and directly by mailbox providers
   * for one-click unsubscribes (RFC 8058), which expect a plain 200.
   */
  async store({ params, request, response, session }: HttpContext) {
    const recipient = await TrackingService.findRecipient(params.token)
    const isOneClick = !request.header('x-inertia')

    if (recipient) {
      await TrackingService.unsubscribe(recipient, {
        ip: request.ip() ?? null,
        userAgent: request.header('user-agent')?.slice(0, 500) ?? null,
      })
    }

    if (isOneClick) {
      return response.status(recipient ? 200 : 404).send(recipient ? 'Unsubscribed' : 'Not found')
    }

    session.flash('success', 'Votre désinscription est confirmée.')
    return response.redirect().toRoute('unsubscribe.show', { token: params.token })
  }

  async destroy({ params, response, session }: HttpContext) {
    const recipient = await TrackingService.findRecipient(params.token)
    if (recipient) {
      await TrackingService.resubscribe(recipient)
      session.flash('success', 'Vous êtes de nouveau inscrit(e).')
    }
    return response.redirect().toRoute('unsubscribe.show', { token: params.token })
  }
}
