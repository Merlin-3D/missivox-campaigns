import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import List from '#models/list'
import Contact from '#models/contact'
import Campaign from '#models/campaign'
import CampaignLink from '#models/campaign_link'
import TrackingEvent from '#models/tracking_event'
import CampaignRecipient from '#models/campaign_recipient'
import CampaignDispatcher from '#services/campaign_dispatcher'
import Workspace from '#models/workspace'

async function sentCampaign() {
  const { id: workspaceId } = await Workspace.create({ name: 'Boutique' })
  const list = await List.create({ workspaceId, name: 'Clients' })
  const contact = await Contact.create({
    workspaceId,
    email: 'awa@example.com',
    firstName: 'Awa',
    status: 'subscribed',
    source: 'manual',
  })
  await list.related('contacts').attach([contact.id])

  const campaign = await Campaign.create({
    workspaceId,
    name: 'Promo',
    subject: 'Promo',
    fromName: 'Boutique',
    fromEmail: 'shop@example.com',
    editor: 'visual',
    body: '<a href="https://shop.test/?e={{ email }}">Voir</a>',
    status: 'draft',
    trackOpens: true,
    trackClicks: true,
  })
  await campaign.related('lists').attach([list.id])
  await CampaignDispatcher.schedule(campaign, null)

  const recipient = await CampaignRecipient.query().where('campaign_id', campaign.id).firstOrFail()
  const link = await CampaignLink.query().where('campaign_id', campaign.id).firstOrFail()
  return { campaign, contact, recipient, link }
}

test.group('Tracking', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('the open pixel records the open and returns a GIF', async ({ client, assert }) => {
    const { recipient } = await sentCampaign()

    const response = await client.get(`/t/o/${recipient.token}`)
    response.assertStatus(200)
    response.assertHeader('content-type', 'image/gif')

    await client.get(`/t/o/${recipient.token}`)
    await recipient.refresh()
    assert.equal(recipient.openCount, 2)
    assert.isNotNull(recipient.openedAt)
  })

  test('an unknown token still returns the pixel', async ({ client }) => {
    const response = await client.get('/t/o/unknown')
    response.assertStatus(200)
  })

  test('a click redirects to the personalised URL and counts as an open', async ({
    client,
    assert,
  }) => {
    const { recipient, link } = await sentCampaign()

    const response = await client.get(`/t/c/${recipient.token}/${link.id}`).redirects(0)
    response.assertStatus(302)
    response.assertHeader('location', 'https://shop.test/?e=awa%40example.com')

    await recipient.refresh()
    assert.equal(recipient.clickCount, 1)
    assert.isNotNull(recipient.openedAt)

    await link.refresh()
    assert.equal(link.clickCount, 1)
  })

  test('a click on a link of another campaign is refused', async ({ client }) => {
    const { recipient } = await sentCampaign()
    const response = await client.get(`/t/c/${recipient.token}/999999`).redirects(0)
    response.assertStatus(404)
  })

  test('one-click unsubscribe from the mailbox provider works without CSRF token', async ({
    client,
    assert,
  }) => {
    const { recipient, contact } = await sentCampaign()

    const response = await client
      .post(`/u/${recipient.token}`)
      .form({ 'List-Unsubscribe': 'One-Click' })
    response.assertStatus(200)

    await contact.refresh()
    assert.equal(contact.status, 'unsubscribed')
    await recipient.refresh()
    assert.isNotNull(recipient.unsubscribedAt)

    const events = await TrackingEvent.query().where('type', 'unsubscribe')
    assert.lengthOf(events, 1)

    /**
     * A second request changes nothing.
     */
    await client.post(`/u/${recipient.token}`).form({ 'List-Unsubscribe': 'One-Click' })
    assert.lengthOf(await TrackingEvent.query().where('type', 'unsubscribe'), 1)
  })

  test('the web version shows the personalised email', async ({ client }) => {
    const { recipient } = await sentCampaign()
    const response = await client.get(`/m/${recipient.token}`)
    response.assertStatus(200)
    response.assertTextIncludes('https://shop.test/?e=awa@example.com')
  })
})
