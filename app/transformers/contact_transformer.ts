import type Contact from '#models/contact'
import ListTransformer from '#transformers/list_transformer'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ContactTransformer extends BaseTransformer<Contact> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'email',
        'firstName',
        'lastName',
        'fullName',
        'company',
        'phone',
        'status',
        'source',
        'unsubscribedAt',
        'createdAt',
        'updatedAt',
      ]),
      attributes: this.resource.attributes ?? {},
      lists: ListTransformer.transform(this.whenLoaded(this.resource.lists)),
    }
  }
}
