import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tracking_events'

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
      table
        .integer('recipient_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('campaign_recipients')
        .onDelete('CASCADE')
        .index()
      table
        .integer('link_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('campaign_links')
        .onDelete('SET NULL')
      table.string('type', 20).notNullable()
      table.string('ip', 64).nullable()
      table.string('user_agent', 500).nullable()

      table.timestamp('created_at').notNullable()
      table.index(['campaign_id', 'type', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
