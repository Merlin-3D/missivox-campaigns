import User from '#models/user'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  async create({ inertia, response }: HttpContext) {
    /**
     * On a fresh install, the first visit goes to the account creation.
     */
    if (!(await User.query().select('id').first())) {
      return response.redirect().toRoute('new_account.create')
    }
    return inertia.render('auth/login', {})
  }

  async store({ request, auth, response, session }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)
    } catch {
      session.flash('inputErrorsBag', { email: ['Email ou mot de passe incorrect.'] })
      session.flashOnly(['email'])
      return response.redirect().back()
    }

    response.redirect().toRoute('dashboard')
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    response.redirect().toRoute('session.create')
  }
}
