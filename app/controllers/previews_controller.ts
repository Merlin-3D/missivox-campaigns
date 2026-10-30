import Contact from '#models/contact'
import Campaign from '#models/campaign'
import PublicUrls from '#services/public_urls'
import SettingsService from '#services/settings_service'
import { contactMergeData, SAMPLE_DATA } from '#services/merge_tags'
import { personalizeEmail, prepareEmail } from '#services/email_renderer'
import { previewValidator } from '#validators/template'
import type { HttpContext } from '@adonisjs/core/http'

export default class PreviewsController {
  /**
   * Renders the content being edited, as a recipient would see it. Used by
   * the live preview of the editors.
   */
  async render({ request, auth }: HttpContext) {
    const { workspaceId } = auth.user!
    const input = await request.validateUsing(previewValidator)
    const contact = input.contactId
      ? await Contact.ofWorkspace(workspaceId).where('id', input.contactId).first()
      : null
    const settings = await SettingsService.all(workspaceId)

    const rendered = personalizeEmail(
      prepareEmail(
        {
          subject: input.subject ?? '',
          preheader: input.preheader ?? null,
          editor: input.editor,
          body: input.body ?? '',
        },
        settings
      ),
      {
        data: contact ? contactMergeData(contact) : SAMPLE_DATA,
        unsubscribeUrl: '#',
        webVersionUrl: '#',
      }
    )

    return { subject: rendered.subject, html: rendered.html, text: rendered.text }
  }

  /**
   * Full-page preview of a saved campaign, opened in a new tab.
   */
  async campaign({ params, response, auth }: HttpContext) {
    const campaign = await Campaign.findOwnedOrFail(auth.user!.workspaceId, params.id)
    const settings = await SettingsService.all(campaign.workspaceId)
    const rendered = personalizeEmail(prepareEmail(campaign, settings), {
      data: SAMPLE_DATA,
      unsubscribeUrl: PublicUrls.preview(),
      webVersionUrl: PublicUrls.preview(),
    })

    response.header('Content-Type', 'text/html; charset=utf-8')
    return rendered.html
  }
}
