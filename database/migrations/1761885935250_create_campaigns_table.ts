import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'campaigns'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('workspace_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('workspaces')
        .onDelete('CASCADE')
        .index()
      table.string('name', 150).notNullable()
      table.string('subject', 255).notNullable()
      table.string('preheader', 255).nullable()
      table.string('from_name', 120).notNullable()
      table.string('from_email', 254).notNullable()
      table.string('reply_to', 254).nullable()
      table.string('editor', 10).notNullable().defaultTo('visual')
      table.text('body').notNullable()
      table.string('status', 20).notNullable().defaultTo('draft').index()
      table.boolean('track_opens').notNullable().defaultTo(true)
      table.boolean('track_clicks').notNullable().defaultTo(true)
      table.integer('recipients_count').unsigned().notNullable().defaultTo(0)
      table.timestamp('scheduled_at').nullable()
      table.timestamp('started_at').nullable()
      table.timestamp('finished_at').nullable()
      table
        .integer('user_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
