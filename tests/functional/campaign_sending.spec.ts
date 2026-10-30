import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import mail from '@adonisjs/mail/services/main'
import testUtils from '@adonisjs/core/services/test_utils'
import List from '#models/list'
import Contact from '#models/contact'
import Campaign from '#models/campaign'
import CampaignLink from '#models/campaign_link'
import CampaignRecipient from '#models/campaign_recipient'
import Workspace from '#models/workspace'
import CampaignSender from '#services/campaign_sender'
import CampaignStatsService from '#services/campaign_stats'
import CampaignDispatcher from '#services/campaign_dispatcher'
import CampaignStateException from '#exceptions/campaign_state_exception'

let workspaceId: number

async function createAudience() {
  const clients = await List.create({ workspaceId, name: 'Clients' })
  const prospects = await List.create({ workspaceId, name: 'Prospects' })

  const awa = await Contact.create({
    workspaceId,
    email: 'Awa@Example.com',
    firstName: 'Awa',
    status: 'subscribed',
    source: 'manual',
  })
  const paul = await Contact.create({
    workspaceId,
    email: 'paul@example.com',
    firstName: 'Paul',
    status: 'subscribed',
    source: 'manual',
  })
  const gone = await Contact.create({
    workspaceId,
    email: 'gone@example.com',
    status: 'unsubscribed',
    source: 'manual',
  })

  await clients.related('contacts').attach([awa.id, paul.id, gone.id])
  /**
   * Awa is in both lists: she must receive the campaign once.
   */
  await prospects.related('contacts').attach([awa.id])

  return { clients, prospects, awa, paul, gone }
}

async function createCampaign(listIds: number[]) {
  const campaign = await Campaign.create({
    workspaceId,
    name: 'Soldes',
    subject: '{{ first_name }}, les soldes commencent',
    preheader: 'Jusqu’à -50 %',
    fromName: 'Boutique',
    fromEmail: 'shop@example.com',
    editor: 'visual',
    body: '<p>Bonjour {{ first_name }}</p><p><a href="https://shop.test/soldes?e={{ email }}">Voir</a></p>',
    status: 'draft',
    trackOpens: true,
    trackClicks: true,
  })
  await campaign.related('lists').attach(listIds)
  return campaign
}

test.group('Campaign sending', (group) => {
  group.each.setup(async () => {
    const cleanup = await testUtils.db().truncate()
    const workspace = await Workspace.create({ name: 'Boutique' })
    workspaceId = workspace.id
    return cleanup
  })

  test('sends one personalised email per subscribed contact', async ({ assert, cleanup }) => {
    const { messages: mails } = mail.fake()
    cleanup(() => mail.restore())

    const { clients, prospects } = await createAudience()
    const campaign = await createCampaign([clients.id, prospects.id])

    await CampaignDispatcher.schedule(campaign, null)
    assert.equal(campaign.status, 'sending')
    assert.equal(campaign.recipientsCount, 2)

    const results = await new CampaignSender().drain()
    assert.deepEqual(results, ['sent', 'sent'])

    mails.assertSentCount(2)
    mails.assertSent((message) => {
      return (
        message.hasTo('awa@example.com') &&
        message.hasSubject('Awa, les soldes commencent') &&
        message.hasFrom('shop@example.com', 'Boutique')
      )
    })

    const [message] = mails.sent()
    const html = message.toObject().message.html as string
    assert.match(html, /\/t\/c\/[0-9a-f]{32}\/\d+/)
    assert.match(html, /\/t\/o\/[0-9a-f]{32}/)
    assert.isTrue(message.hasHeader('List-Unsubscribe-Post', 'List-Unsubscribe=One-Click'))

    await campaign.refresh()
    assert.equal(campaign.status, 'sent')
    assert.isNotNull(campaign.finishedAt)
  })

  test('skips contacts who unsubscribed after the campaign started', async ({
    assert,
    cleanup,
  }) => {
    const { messages: mails } = mail.fake()
    cleanup(() => mail.restore())

    const { clients, paul } = await createAudience()
    const campaign = await createCampaign([clients.id])
    await CampaignDispatcher.schedule(campaign, null)

    paul.status = 'unsubscribed'
    await paul.save()

    const results = await new CampaignSender().drain()
    assert.sameMembers(results, ['sent', 'skipped'])
    mails.assertSentCount(1)

    const stats = await CampaignStatsService.forCampaign(campaign.id)
    assert.equal(stats.sent, 1)
    assert.equal(stats.skipped, 1)
  })

  test('only starts scheduled campaigns when their date comes', async ({ assert, cleanup }) => {
    const { messages: mails } = mail.fake()
    cleanup(() => mail.restore())

    const { clients } = await createAudience()
    const campaign = await createCampaign([clients.id])
    await CampaignDispatcher.schedule(campaign, DateTime.now().plus({ hours: 2 }))

    await new CampaignSender().drain()
    mails.assertNoneSent()
    await campaign.refresh()
    assert.equal(campaign.status, 'scheduled')

    campaign.scheduledAt = DateTime.now().minus({ minutes: 1 })
    await campaign.save()

    await new CampaignSender().drain()
    mails.assertSentCount(2)
  })

  test('refuses to send a campaign without recipients', async ({ assert }) => {
    const empty = await List.create({ workspaceId, name: 'Vide' })
    const campaign = await createCampaign([empty.id])

    await assert.rejects(
      () => CampaignDispatcher.schedule(campaign, null),
      CampaignStateException as any
    )
    await campaign.refresh()
    assert.equal(campaign.status, 'draft')
  })

  test('cancelling marks the remaining emails as skipped', async ({ assert, cleanup }) => {
    const { messages: mails } = mail.fake()
    cleanup(() => mail.restore())

    const { clients } = await createAudience()
    const campaign = await createCampaign([clients.id])
    await CampaignDispatcher.schedule(campaign, null)
    await CampaignDispatcher.cancel(campaign)

    await new CampaignSender().drain()
    mails.assertNoneSent()

    const pending = await CampaignRecipient.query()
      .where('campaign_id', campaign.id)
      .where('status', 'pending')
    assert.lengthOf(pending, 0)
  })

  test('retries a failed email later, then gives up', async ({ assert, cleanup }) => {
    const fake = mail.fake()
    cleanup(() => mail.restore())

    const { clients } = await createAudience()
    const campaign = await createCampaign([clients.id])
    await CampaignDispatcher.schedule(campaign, null)

    const original = fake.send.bind(fake)
    fake.send = async () => {
      throw Object.assign(new Error('451 Try again later'), { responseCode: 451 })
    }
    cleanup(() => {
      fake.send = original
    })

    const sender = new CampaignSender()
    assert.deepEqual(await sender.drain(), ['retry', 'retry'])

    const recipient = await CampaignRecipient.query()
      .where('campaign_id', campaign.id)
      .firstOrFail()
    assert.equal(recipient.status, 'pending')
    assert.equal(recipient.attempts, 1)
    assert.isTrue(recipient.nextAttemptAt! > DateTime.now())

    /**
     * Exhaust the attempts.
     */
    for (let attempt = 0; attempt < 3; attempt++) {
      await CampaignRecipient.query()
        .where('campaign_id', campaign.id)
        .update({ next_attempt_at: null })
      await sender.drain()
    }

    await recipient.refresh()
    assert.equal(recipient.status, 'failed')
    await campaign.refresh()
    assert.equal(campaign.status, 'sent')
  })

  test('a rejected address is marked as bounced', async ({ assert, cleanup }) => {
    const fake = mail.fake()
    cleanup(() => mail.restore())

    const { prospects, awa } = await createAudience()
    const campaign = await createCampaign([prospects.id])
    await CampaignDispatcher.schedule(campaign, null)

    fake.send = async () => {
      throw Object.assign(new Error('550 No such user'), { responseCode: 550, command: 'RCPT TO' })
    }

    assert.deepEqual(await new CampaignSender().drain(), ['failed'])
    await awa.refresh()
    assert.equal(awa.status, 'bounced')
  })

  test('registers the tracked links of the campaign', async ({ assert }) => {
    const { clients } = await createAudience()
    const campaign = await createCampaign([clients.id])
    await CampaignDispatcher.schedule(campaign, null)

    const links = await CampaignLink.query().where('campaign_id', campaign.id)
    assert.deepEqual(
      links.map((link) => link.url),
      ['https://shop.test/soldes?e={{ email }}']
    )
  })
})
