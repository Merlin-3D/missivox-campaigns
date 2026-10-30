import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Health of the sending worker, shared by all workspaces: the web server
 * reads it to tell whether a worker is running.
 */
export default class extends BaseSchema {
  protected tableName = 'worker_states'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('key', 100).primary()
      table.json('value').nullable()

      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
