import type Campaign from '#models/campaign'
import ListTransformer from '#transformers/list_transformer'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class CampaignTransformer extends BaseTransformer<Campaign> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'name',
        'subject',
        'preheader',
        'fromName',
        'fromEmail',
        'replyTo',
        'editor',
        'body',
        'status',
        'trackOpens',
        'trackClicks',
        'recipientsCount',
        'scheduledAt',
        'startedAt',
        'finishedAt',
        'createdAt',
        'updatedAt',
        'isEditable',
        'isDeletable',
      ]),
      lists: ListTransformer.transform(this.whenLoaded(this.resource.lists)),
    }
  }

  /**
   * Without the content, for listings.
   */
  summary() {
    return {
      ...this.pick(this.resource, [
        'id',
        'name',
        'subject',
        'status',
        'recipientsCount',
        'scheduledAt',
        'startedAt',
        'finishedAt',
        'createdAt',
        'updatedAt',
      ]),
      lists: ListTransformer.transform(this.whenLoaded(this.resource.lists)),
    }
  }
}
