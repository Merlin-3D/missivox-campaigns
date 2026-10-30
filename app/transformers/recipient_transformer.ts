import type CampaignRecipient from '#models/campaign_recipient'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class RecipientTransformer extends BaseTransformer<CampaignRecipient> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'campaignId',
      'contactId',
      'email',
      'status',
      'attempts',
      'error',
      'sentAt',
      'openedAt',
      'openCount',
      'clickedAt',
      'clickCount',
      'unsubscribedAt',
    ])
  }
}
