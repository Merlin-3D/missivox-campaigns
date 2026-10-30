/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'
import db from '@adonisjs/lucid/services/db'

router.get('/', ({ response }) => response.redirect().toRoute('dashboard')).as('home')

/**
 * Probed by Docker: the server answers and its database is reachable.
 */
router
  .get('health', async () => {
    await db.rawQuery('select 1')
    return { status: 'ok' }
  })
  .as('health')

/**
 * Public endpoints reached from the emails.
 */
router.get('t/o/:token', [controllers.Tracking, 'open']).as('tracking.open')
router.get('t/c/:token/:link', [controllers.Tracking, 'click']).as('tracking.click')
router.get('m/:token', [controllers.Tracking, 'webVersion']).as('tracking.web_version')
router.get('u/:token', [controllers.Unsubscribe, 'show']).as('unsubscribe.show')
router.post('u/:token', [controllers.Unsubscribe, 'store']).as('unsubscribe.store')
router.delete('u/:token', [controllers.Unsubscribe, 'destroy']).as('unsubscribe.destroy')

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.get('dashboard', [controllers.Dashboard, 'index']).as('dashboard')
    router.post('logout', [controllers.Session, 'destroy'])

    /**
     * Contacts and lists
     */
    router.get('contacts/import', [controllers.ContactImports, 'create'])
    router.post('contacts/import', [controllers.ContactImports, 'store'])
    router.get('contacts/export', [controllers.Contacts, 'export'])
    router.post('contacts/bulk', [controllers.Contacts, 'bulk'])
    router.resource('contacts', controllers.Contacts).where('id', router.matchers.number())

    router
      .resource('lists', controllers.Lists)
      .only(['index', 'store', 'update', 'destroy'])
      .where('id', router.matchers.number())

    /**
     * Templates
     */
    router
      .resource('templates', controllers.Templates)
      .except(['show'])
      .where('id', router.matchers.number())
    router.post('templates/:id/duplicate', [controllers.Templates, 'duplicate'])

    /**
     * Campaigns
     */
    router.resource('campaigns', controllers.Campaigns).where('id', router.matchers.number())
    router
      .group(() => {
        router.post('duplicate', [controllers.Campaigns, 'duplicate'])
        router.post('test', [controllers.CampaignActions, 'test'])
        router.post('schedule', [controllers.CampaignActions, 'schedule'])
        router.post('unschedule', [controllers.CampaignActions, 'unschedule'])
        router.post('pause', [controllers.CampaignActions, 'pause'])
        router.post('resume', [controllers.CampaignActions, 'resume'])
        router.post('cancel', [controllers.CampaignActions, 'cancel'])
        router.get('preview', [controllers.Previews, 'campaign'])
      })
      .prefix('campaigns/:id')
      .where('id', router.matchers.number())

    router.post('preview', [controllers.Previews, 'render'])

    /**
     * Settings
     */
    router.get('settings', [controllers.Settings, 'edit'])
    router.put('settings', [controllers.Settings, 'update'])
    router.put('settings/smtp', [controllers.Settings, 'updateSmtp'])
    router.delete('settings/smtp', [controllers.Settings, 'destroySmtp'])
    router.post('settings/smtp-test', [controllers.Settings, 'testSmtp'])
    router.get('settings/team', [controllers.Team, 'index'])
    router.post('settings/team', [controllers.Team, 'store'])
    router.delete('settings/team/:id', [controllers.Team, 'destroy'])
    router.put('settings/password', [controllers.Team, 'updatePassword'])
  })
  .use(middleware.auth())
