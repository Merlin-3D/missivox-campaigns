import logger from '@adonisjs/core/services/logger'
import Campaign from '#models/campaign'
import Contact from '#models/contact'
import PublicUrls from '#services/public_urls'
import TrackingService from '#services/tracking_service'
import SettingsService from '#services/settings_service'
import { contactMergeData } from '#services/merge_tags'
import { personalizeEmail, prepareEmail } from '#services/email_renderer'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Transparent 1×1 GIF.
 */
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')

function requestInfo({ request }: HttpContext) {
  return {
    ip: request.ip() ?? null,
    userAgent: request.header('user-agent')?.slice(0, 500) ?? null,
  }
}

/**
 * Public endpoints reached from the emails. They never fail visibly: a
 * broken tracking link must not stop the reader.
 */
export default class TrackingController {
  async open(ctx: HttpContext) {
    const { params, response } = ctx

    try {
      const recipient = await TrackingService.findRecipient(params.token)
      if (recipient) await TrackingService.recordOpen(recipient, requestInfo(ctx))
    } catch (error) {
      logger.error({ err: error }, 'could not record an open')
    }

    response.header('Content-Type', 'image/gif')
    response.header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    return PIXEL
  }

  async click(ctx: HttpContext) {
    const { params, response, inertia } = ctx
    const recipient = await TrackingService.findRecipient(params.token)
    const destination = recipient
      ? await TrackingService.recordClick(recipient, Number(params.link), requestInfo(ctx))
      : null

    if (!destination) {
      response.status(404)
      return inertia.render('public/message', {
        title: 'Lien introuvable',
        message: "Ce lien n'existe plus ou a été mal copié.",
      })
    }

    return response.redirect(destination)
  }

  /**
   * The "view in the browser" version of an email, personalised for the
   * recipient but without the tracking image.
   */
  async webVersion({ params, response, inertia }: HttpContext) {
    const recipient = await TrackingService.findRecipient(params.token)
    const campaign = recipient ? await Campaign.find(recipient.campaignId) : null

    if (!recipient || !campaign) {
      response.status(404)
      return inertia.render('public/message', {
        title: 'Email introuvable',
        message: "Cet email n'est plus disponible.",
      })
    }

    const contact = recipient.contactId ? await Contact.find(recipient.contactId) : null
    const settings = await SettingsService.all(campaign.workspaceId)
    const rendered = personalizeEmail(prepareEmail(campaign, settings), {
      data: contact ? contactMergeData(contact) : { email: recipient.email },
      unsubscribeUrl: PublicUrls.unsubscribe(recipient.token),
      webVersionUrl: PublicUrls.webVersion(recipient.token),
    })

    response.header('Content-Type', 'text/html; charset=utf-8')
    return rendered.html
  }
}
