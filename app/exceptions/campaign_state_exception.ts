import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Raised when an action does not fit the current state of a campaign, for
 * example sending a campaign without recipients. The message is meant for
 * the user: it is flashed and the user is sent back.
 */
export default class CampaignStateException extends Exception {
  static status = 409
  static code = 'E_CAMPAIGN_STATE'

  async handle(error: this, ctx: HttpContext) {
    ctx.session.flash('error', error.message)
    ctx.response.redirect().back()
  }
}
