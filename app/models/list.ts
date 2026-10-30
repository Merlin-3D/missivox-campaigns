import { ListSchema } from '#database/schema'
import Contact from '#models/contact'
import { manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'

export default class List extends ListSchema {
  @manyToMany(() => Contact, {
    pivotTable: 'contact_list',
    pivotTimestamps: { createdAt: 'created_at', updatedAt: false },
  })
  declare contacts: ManyToMany<typeof Contact>

  static ofWorkspace(workspaceId: number) {
    return this.query().where('lists.workspace_id', workspaceId)
  }

  /**
   * Keeps the ids of the lists that belong to the workspace, so a form
   * cannot reach the lists of another workspace.
   */
  static async ownedIds(workspaceId: number, ids: number[] | undefined) {
    if (!ids?.length) return []
    const lists = await this.ofWorkspace(workspaceId).whereIn('id', ids).select('id')
    return lists.map((list) => list.id)
  }
}
