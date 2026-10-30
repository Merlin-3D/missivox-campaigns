import env from '#start/env'

/**
 * Absolute URLs placed in the emails. They must point to the public
 * address of the app (APP_URL), never to the current request host.
 */
export default class PublicUrls {
  static base() {
    return env.get('APP_URL').replace(/\/+$/, '')
  }

  static unsubscribe(token: string) {
    return `${this.base()}/u/${token}`
  }

  static webVersion(token: string) {
    return `${this.base()}/m/${token}`
  }

  /**
   * Links used in previews and test emails, which have no recipient.
   */
  static preview() {
    return `${this.base()}/u/preview`
  }
}
