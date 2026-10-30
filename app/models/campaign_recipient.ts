import { CampaignRecipientSchema } from '#database/schema'
import Campaign from '#models/campaign'
import Contact from '#models/contact'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class CampaignRecipient extends CampaignRecipientSchema {
  static table = 'campaign_recipients'

  @belongsTo(() => Campaign)
  declare campaign: BelongsTo<typeof Campaign>

  @belongsTo(() => Contact)
  declare contact: BelongsTo<typeof Contact>
}
