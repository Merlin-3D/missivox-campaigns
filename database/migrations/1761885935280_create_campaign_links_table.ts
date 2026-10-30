import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'campaign_links'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('campaign_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('campaigns')
        .onDelete('CASCADE')
      table.text('url').notNullable()
      table.integer('click_count').unsigned().notNullable().defaultTo(0)

      table.timestamp('created_at').notNullable()
      table.unique(['campaign_id', 'url'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
