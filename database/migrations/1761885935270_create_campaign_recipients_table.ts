import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'campaign_recipients'

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
        .integer('contact_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('contacts')
        .onDelete('SET NULL')
        .index()
      table.string('email', 254).notNullable()
      table.string('token', 40).notNullable().unique()
      table.string('status', 20).notNullable().defaultTo('pending')
      table.integer('attempts').unsigned().notNullable().defaultTo(0)
      table.timestamp('next_attempt_at').nullable()
      table.text('error').nullable()
      table.timestamp('sent_at').nullable()
      table.timestamp('opened_at').nullable()
      table.integer('open_count').unsigned().notNullable().defaultTo(0)
      table.timestamp('clicked_at').nullable()
      table.integer('click_count').unsigned().notNullable().defaultTo(0)
      table.timestamp('unsubscribed_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['campaign_id', 'contact_id'])
      table.index(['campaign_id', 'status'])
      table.index(['status', 'next_attempt_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
