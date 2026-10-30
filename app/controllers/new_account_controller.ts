import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import Workspace from '#models/workspace'
import SettingsService from '#services/settings_service'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Anyone can create an account: it comes with its own workspace, empty
 * and invisible to the other workspaces. Teammates are then added from
 * the team settings.
 */
export default class NewAccountController {
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/signup', {})
  }

  async store({ request, response, auth, session }: HttpContext) {
    const { fullName, companyName, email, password } = await request.validateUsing(signupValidator)

    const user = await db.transaction(async (trx) => {
      const workspace = await Workspace.create({ name: companyName }, { client: trx })
      return User.create({ workspaceId: workspace.id, fullName, email, password }, { client: trx })
    })

    /**
     * Until they are changed, campaigns are sent in the name of the
     * company, from the address used to sign up.
     */
    await SettingsService.update(user.workspaceId, {
      senderName: companyName,
      senderEmail: email,
      companyName,
    })

    await auth.use('web').login(user)
    session.flash(
      'success',
      'Bienvenue ! Renseignez votre serveur d’envoi pour pouvoir écrire à vos contacts.'
    )
    response.redirect().toRoute('settings.edit')
  }
}
