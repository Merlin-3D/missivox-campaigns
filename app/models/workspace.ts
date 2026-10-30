import { WorkspaceSchema } from '#database/schema'
import User from '#models/user'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Workspace extends WorkspaceSchema {
  @hasMany(() => User)
  declare users: HasMany<typeof User>
}
