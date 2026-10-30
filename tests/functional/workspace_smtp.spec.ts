import { test } from '@japa/runner'
import env from '#start/env'
import mail from '@adonisjs/mail/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import List from '#models/list'
import Contact from '#models/contact'
import Setting from '#models/setting'
import Campaign from '#models/campaign'
import Workspace from '#models/workspace'
import SettingsService from '#services/settings_service'
import WorkspaceMailer from '#services/workspace_mailer'
import CampaignDispatcher from '#services/campaign_dispatcher'
import CampaignStateException from '#exceptions/campaign_state_exception'

const SERVER = {
  host: 'smtp.example.com',
  port: 465,
  secure: true,
  username: 'no-reply@example.com',
  password: 'smtp-secret',
}

test.group('Workspace SMTP server', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('stores the password encrypted and keeps it when left empty', async ({ assert }) => {
    const workspace = await Workspace.create({ name: 'Boutique' })
    await SettingsService.updateSmtp(workspace.id, SERVER)

    const row = await Setting.query()
      .where('workspace_id', workspace.id)
      .where('key', 'smtp')
      .firstOrFail()
    assert.notInclude(JSON.stringify(row.value), 'smtp-secret')
    assert.deepEqual(await SettingsService.smtp(workspace.id), SERVER)

    await SettingsService.updateSmtp(workspace.id, { ...SERVER, port: 587, password: null })
    const updated = await SettingsService.smtp(workspace.id)
    assert.equal(updated?.port, 587)
    assert.equal(updated?.password, 'smtp-secret')
  })

  test('a workspace sends through its own server', async ({ assert, cleanup }) => {
    mail.fake()
    cleanup(() => mail.restore())

    const workspace = await Workspace.create({ name: 'Boutique' })
    assert.strictEqual(await WorkspaceMailer.for(workspace.id), mail.use())

    await SettingsService.updateSmtp(workspace.id, SERVER)
    assert.notStrictEqual(await WorkspaceMailer.for(workspace.id), mail.use())
  })

  test('without a server of its own, a workspace cannot send when the shared one is off', async ({
    assert,
    cleanup,
  }) => {
    env.set('SMTP_SHARED', false)
    cleanup(() => env.set('SMTP_SHARED', true))

    const { id: workspaceId } = await Workspace.create({ name: 'Boutique' })
    const list = await List.create({ workspaceId, name: 'Clients' })
    const contact = await Contact.create({
      workspaceId,
      email: 'awa@example.com',
      status: 'subscribed',
      source: 'manual',
    })
    await list.related('contacts').attach([contact.id])
    const campaign = await Campaign.create({
      workspaceId,
      name: 'Soldes',
      subject: 'Soldes',
      fromName: 'Boutique',
      fromEmail: 'shop@example.com',
      editor: 'visual',
      body: '<p>Bonjour</p>',
      status: 'draft',
      trackOpens: true,
      trackClicks: true,
    })
    await campaign.related('lists').attach([list.id])

    assert.isNull(await WorkspaceMailer.for(workspaceId))
    const error = await CampaignDispatcher.schedule(campaign, null).catch((reason) => reason)
    assert.instanceOf(error, CampaignStateException)
    assert.match(error.message, /serveur d'envoi/)
  })
})
