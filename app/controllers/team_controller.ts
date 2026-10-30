import hash from '@adonisjs/core/services/hash'
import User from '#models/user'
import UserTransformer from '#transformers/user_transformer'
import { passwordValidator, teamMemberValidator } from '#validators/settings'
import type { HttpContext } from '@adonisjs/core/http'

export default class TeamController {
  async index({ inertia, auth }: HttpContext) {
    const users = await User.query()
      .where('workspace_id', auth.user!.workspaceId)
      .orderBy('created_at')
    return inertia.render('settings/team', {
      members: UserTransformer.transform(users),
    })
  }

  /**
   * Adds a teammate to the workspace of the current user.
   */
  async store({ request, response, session, auth }: HttpContext) {
    const user = await User.create({
      ...(await request.validateUsing(teamMemberValidator)),
      workspaceId: auth.user!.workspaceId,
    })

    session.flash('success', `${user.email} peut maintenant se connecter.`)
    return response.redirect().back()
  }

  async destroy({ params, response, session, auth }: HttpContext) {
    const user = await User.query()
      .where('workspace_id', auth.user!.workspaceId)
      .where('id', params.id)
      .firstOrFail()
    if (user.id === auth.user!.id) {
      session.flash('error', 'Vous ne pouvez pas supprimer votre propre compte.')
      return response.redirect().back()
    }

    await user.delete()
    session.flash('success', `${user.email} n'a plus accès à l'application.`)
    return response.redirect().back()
  }

  async updatePassword({ request, response, session, auth }: HttpContext) {
    const user = auth.user!
    const { currentPassword, password } = await request.validateUsing(passwordValidator)

    if (!(await hash.verify(user.password, currentPassword))) {
      session.flash('inputErrorsBag', {
        currentPassword: ['Le mot de passe actuel est incorrect.'],
      })
      return response.redirect().back()
    }

    user.password = password
    await user.save()

    session.flash('success', 'Votre mot de passe a été modifié.')
    return response.redirect().back()
  }
}
