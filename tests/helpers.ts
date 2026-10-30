import User from '#models/user'
import Workspace from '#models/workspace'

/**
 * A workspace with one member who can sign in.
 */
export async function createMember(email = 'owner@example.com', workspaceName = 'Boutique') {
  const workspace = await Workspace.create({ name: workspaceName })
  const user = await User.create({ workspaceId: workspace.id, email, password: 'secret-password' })
  return { workspace, user }
}
