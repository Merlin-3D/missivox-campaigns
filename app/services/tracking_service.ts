import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Contact from '#models/contact'
import CampaignLink from '#models/campaign_link'
import TrackingEvent from '#models/tracking_event'
import CampaignRecipient from '#models/campaign_recipient'
import { contactMergeData, renderMergeTags } from '#services/merge_tags'

type RequestInfo = { ip: string | null; userAgent: string | null }

/**
 * Records opens, clicks and unsubscribes coming from the emails.
 */
export default class TrackingService {
  static findRecipient(token: string) {
    return CampaignRecipient.query().where('token', token).first()
  }

  static async recordOpen(recipient: CampaignRecipient, info: RequestInfo) {
    await db.transaction(async (trx) => {
      recipient.useTransaction(trx)
      recipient.openCount += 1
      recipient.openedAt ??= DateTime.now()
      await recipient.save()

      await TrackingEvent.create(
        { campaignId: recipient.campaignId, recipientId: recipient.id, type: 'open', ...info },
        { client: trx }
      )
    })
  }

  /**
   * Records the click and returns the destination, personalised for the
   * recipient. A click also counts as an open, since many inboxes block
   * the tracking image.
   */
  static async recordClick(recipient: CampaignRecipient, linkId: number, info: RequestInfo) {
    const link = await CampaignLink.query()
      .where('id', linkId)
      .where('campaign_id', recipient.campaignId)
      .first()
    if (!link) return null

    await db.transaction(async (trx) => {
      recipient.useTransaction(trx)
      recipient.clickCount += 1
      recipient.clickedAt ??= DateTime.now()
      if (!recipient.openedAt) {
        recipient.openedAt = DateTime.now()
        recipient.openCount += 1
      }
      await recipient.save()

      await trx.from('campaign_links').where('id', link.id).increment('click_count', 1)
      await TrackingEvent.create(
        {
          campaignId: recipient.campaignId,
          recipientId: recipient.id,
          linkId: link.id,
          type: 'click',
          ...info,
        },
        { client: trx }
      )
    })

    const contact = recipient.contactId ? await Contact.find(recipient.contactId) : null
    return contact
      ? renderMergeTags(link.url, contactMergeData(contact), { escape: encodeURIComponent })
      : renderMergeTags(link.url, {}, { escape: false })
  }

  /**
   * Unsubscribes the contact behind a recipient. Safe to call twice.
   */
  static async unsubscribe(recipient: CampaignRecipient, info: RequestInfo) {
    if (recipient.unsubscribedAt) return

    await db.transaction(async (trx) => {
      recipient.useTransaction(trx)
      recipient.unsubscribedAt = DateTime.now()
      await recipient.save()

      if (recipient.contactId) {
        const contact = await Contact.find(recipient.contactId, { client: trx })
        if (contact && contact.status === 'subscribed') {
          contact.status = 'unsubscribed'
          contact.unsubscribedAt = DateTime.now()
          await contact.save()
        }
      }

      await TrackingEvent.create(
        {
          campaignId: recipient.campaignId,
          recipientId: recipient.id,
          type: 'unsubscribe',
          ...info,
        },
        { client: trx }
      )
    })
  }

  /**
   * Allows a contact who unsubscribed by mistake to subscribe again from
   * the confirmation page.
   */
  static async resubscribe(recipient: CampaignRecipient) {
    await db.transaction(async (trx) => {
      recipient.useTransaction(trx)
      recipient.unsubscribedAt = null
      await recipient.save()

      if (recipient.contactId) {
        const contact = await Contact.find(recipient.contactId, { client: trx })
        if (contact && contact.status === 'unsubscribed') {
          contact.status = 'subscribed'
          contact.unsubscribedAt = null
          await contact.save()
        }
      }
    })
  }
}
