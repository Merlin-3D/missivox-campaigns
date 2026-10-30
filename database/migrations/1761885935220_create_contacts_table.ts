import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'contacts'

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
      table.string('email', 254).notNullable()
      table.string('first_name', 100).nullable()
      table.string('last_name', 100).nullable()
      table.string('company', 150).nullable()
      table.string('phone', 40).nullable()
      table.json('attributes').nullable()
      table.string('status', 20).notNullable().defaultTo('subscribed').index()
      table.string('source', 20).notNullable().defaultTo('manual')
      table.timestamp('unsubscribed_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      /**
       * The same person can be a contact of several workspaces.
       */
      table.unique(['workspace_id', 'email'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
