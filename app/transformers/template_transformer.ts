import type Template from '#models/template'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class TemplateTransformer extends BaseTransformer<Template> {
  toObject() {
    return this.pick(this.resource, ['id', 'name', 'subject', 'editor', 'body', 'updatedAt'])
  }

  /**
   * Without the body, for listings.
   */
  summary() {
    return this.pick(this.resource, ['id', 'name', 'subject', 'editor', 'updatedAt'])
  }
}
