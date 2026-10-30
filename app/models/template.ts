import { TemplateSchema } from '#database/schema'

export default class Template extends TemplateSchema {
  static ofWorkspace(workspaceId: number) {
    return this.query().where('templates.workspace_id', workspaceId)
  }

  static findOwnedOrFail(workspaceId: number, id: number) {
    return this.ofWorkspace(workspaceId).where('id', id).firstOrFail()
  }
}
