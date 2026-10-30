import { DateTime } from 'luxon'
import Campaign from '#models/campaign'
import Contact from '#models/contact'
import PublicUrls from '#services/public_urls'
import SettingsService from '#services/settings_service'
import WorkspaceMailer from '#services/workspace_mailer'
import CampaignDispatcher from '#services/campaign_dispatcher'
import { contactMergeData, SAMPLE_DATA } from '#services/merge_tags'
import { personalizeEmail, prepareEmail } from '#services/email_renderer'
import CampaignStateException from '#exceptions/campaign_state_exception'
import { scheduleCampaignValidator, testCampaignValidator } from '#validators/campaign'
import type { HttpContext } from '@adonisjs/core/http'

const MAX_TEST_RECIPIENTS = 5
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default class CampaignActionsController {
  /**
   * Sends the campaign to a few addresses, without tracking. Addresses that
   * belong to a contact are personalised with that contact's data.
   */
  async test({ params, request, response, session, auth }: HttpContext) {
    const { workspaceId } = auth.user!
    const campaign = await Campaign.findOwnedOrFail(workspaceId, params.id)
    const { emails } = await request.validateUsing(testCampaignValidator)

    const addresses = [
      ...new Set(
        emails
          .split(/[\s,;]+/)
          .map((email) => email.trim().toLowerCase())
          .filter(Boolean)
      ),
    ]
    const invalid = addresses.filter((email) => !EMAIL_PATTERN.test(email))
    if (invalid.length > 0) {
      session.flash('error', `Adresse(s) invalide(s) : ${invalid.join(', ')}`)
      return response.redirect().back()
    }
    if (addresses.length > MAX_TEST_RECIPIENTS) {
      session.flash('error', `${MAX_TEST_RECIPIENTS} adresses au maximum pour un test.`)
      return response.redirect().back()
    }

    const mailer = await WorkspaceMailer.for(workspaceId)
    if (!mailer) {
      session.flash('error', "Renseignez votre serveur d'envoi (SMTP) dans les réglages.")
      return response.redirect().back()
    }

    const settings = await SettingsService.all(workspaceId)
    const prepared = prepareEmail(campaign, settings)
    const contacts = await Contact.ofWorkspace(workspaceId).whereIn('email', addresses)

    try {
      for (const address of addresses) {
        const contact = contacts.find((item) => item.email === address)
        const rendered = personalizeEmail(prepared, {
          data: contact ? contactMergeData(contact) : { ...SAMPLE_DATA, email: address },
          unsubscribeUrl: PublicUrls.preview(),
          webVersionUrl: PublicUrls.preview(),
        })

        await mailer.send((message) => {
          message
            .from(campaign.fromEmail, campaign.fromName)
            .to(address)
            .subject(`[TEST] ${rendered.subject}`)
            .html(rendered.html)
            .text(rendered.text)
          const replyTo = campaign.replyTo || settings.replyTo
          if (replyTo) message.replyTo(replyTo)
        })
      }
    } catch (error) {
      session.flash(
        'error',
        `L'envoi du test a échoué : ${error instanceof Error ? error.message : String(error)}`
      )
      return response.redirect().back()
    }

    session.flash('success', `Email de test envoyé à ${addresses.join(', ')}.`)
    return response.redirect().back()
  }

  /**
   * Sends now, or schedules when a date is given.
   */
  async schedule({ params, request, response, session, auth }: HttpContext) {
    const campaign = await Campaign.findOwnedOrFail(auth.user!.workspaceId, params.id)
    const { sendAt } = await request.validateUsing(scheduleCampaignValidator)

    let date: DateTime | null = null
    if (sendAt) {
      date = DateTime.fromISO(sendAt, { setZone: true })
      if (!date.isValid) throw new CampaignStateException("La date d'envoi est invalide.")
      date = date.toLocal()
    }

    await CampaignDispatcher.schedule(campaign, date)

    session.flash(
      'success',
      date
        ? 'Campagne programmée.'
        : `Envoi lancé vers ${campaign.recipientsCount} destinataire(s).`
    )
    return response.redirect().toRoute('campaigns.show', { id: campaign.id })
  }

  async unschedule({ params, response, session, auth }: HttpContext) {
    const campaign = await Campaign.findOwnedOrFail(auth.user!.workspaceId, params.id)
    await CampaignDispatcher.unschedule(campaign)

    session.flash('success', 'La campagne est repassée en brouillon.')
    return response.redirect().toRoute('campaigns.edit', { id: campaign.id })
  }

  async pause({ params, response, session, auth }: HttpContext) {
    await CampaignDispatcher.pause(
      await Campaign.findOwnedOrFail(auth.user!.workspaceId, params.id)
    )
    session.flash('success', "L'envoi est en pause.")
    return response.redirect().back()
  }

  async resume({ params, response, session, auth }: HttpContext) {
    await CampaignDispatcher.resume(
      await Campaign.findOwnedOrFail(auth.user!.workspaceId, params.id)
    )
    session.flash('success', "L'envoi a repris.")
    return response.redirect().back()
  }

  async cancel({ params, response, session, auth }: HttpContext) {
    await CampaignDispatcher.cancel(
      await Campaign.findOwnedOrFail(auth.user!.workspaceId, params.id)
    )
    session.flash('success', "L'envoi a été annulé. Les emails restants ne partiront pas.")
    return response.redirect().back()
  }
}
