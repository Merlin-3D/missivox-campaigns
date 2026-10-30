import { CampaignSchema } from '#database/schema'
import User from '#models/user'
import List from '#models/list'
import CampaignLink from '#models/campaign_link'
import CampaignRecipient from '#models/campaign_recipient'
import { belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'

export default class Campaign extends CampaignSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @manyToMany(() => List, { pivotTable: 'campaign_list' })
  declare lists: ManyToMany<typeof List>

  @hasMany(() => CampaignRecipient)
  declare recipients: HasMany<typeof CampaignRecipient>

  @hasMany(() => CampaignLink)
  declare links: HasMany<typeof CampaignLink>

  static ofWorkspace(workspaceId: number) {
    return this.query().where('campaigns.workspace_id', workspaceId)
  }

  /**
   * A campaign of another workspace is reported as not found.
   */
  static findOwnedOrFail(workspaceId: number, id: number) {
    return this.ofWorkspace(workspaceId).where('id', id).firstOrFail()
  }

  /**
   * Content and audience can only change before the campaign is queued.
   */
  get isEditable() {
    return this.status === 'draft'
  }

  /**
   * A campaign that has started sending keeps its history: it can be
   * cancelled, but not deleted.
   */
  get isDeletable() {
    return this.status === 'draft' || this.status === 'scheduled' || this.status === 'cancelled'
  }
}
