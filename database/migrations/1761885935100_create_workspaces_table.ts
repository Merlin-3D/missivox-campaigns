import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * A workspace holds the contacts, lists, templates, campaigns and settings
 * of one organisation. Each signup creates one; teammates join it.
 */
export default class extends BaseSchema {
  protected tableName = 'workspaces'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name', 150).notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
