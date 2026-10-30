import type List from '#models/list'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ListTransformer extends BaseTransformer<List> {
  toObject() {
    return this.pick(this.resource, ['id', 'name', 'description', 'createdAt'])
  }

  /**
   * Lists loaded with `withCount` subqueries, as on the lists page.
   */
  withCounts() {
    return {
      ...this.toObject(),
      contactsCount: Number(this.resource.$extras.contacts_count ?? 0) as number,
      subscribedCount: Number(this.resource.$extras.subscribed_count ?? 0) as number,
    }
  }
}
