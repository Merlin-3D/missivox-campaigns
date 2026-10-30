import { ContactSchema } from '#database/schema'
import List from '#models/list'
import CampaignRecipient from '#models/campaign_recipient'
import { beforeSave, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Contact extends ContactSchema {
  @manyToMany(() => List, {
    pivotTable: 'contact_list',
    pivotTimestamps: { createdAt: 'created_at', updatedAt: false },
  })
  declare lists: ManyToMany<typeof List>

  @hasMany(() => CampaignRecipient)
  declare deliveries: HasMany<typeof CampaignRecipient>

  static ofWorkspace(workspaceId: number) {
    return this.query().where('contacts.workspace_id', workspaceId)
  }

  get fullName() {
    return [this.firstName, this.lastName].filter(Boolean).join(' ') || null
  }

  /**
   * Emails are compared case-insensitively everywhere, so they are always
   * stored trimmed and lower-cased.
   */
  @beforeSave()
  static normalizeEmail(contact: Contact) {
    if (contact.$dirty.email) {
      contact.email = Contact.normalize(contact.email)
    }
  }

  static normalize(email: string) {
    return email.trim().toLowerCase()
  }
}
