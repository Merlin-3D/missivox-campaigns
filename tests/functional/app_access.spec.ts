import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import List from '#models/list'
import Contact from '#models/contact'
import Campaign from '#models/campaign'
import SettingsService from '#services/settings_service'
import { createMember } from '#tests/helpers'

test.group('App access', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('guests are sent to the login page', async ({ client }) => {
    const response = await client.get('/contacts').redirects(0)
    response.assertStatus(302)
    response.assertHeader('location', '/login')
  })

  test('a fresh install opens the account creation', async ({ client }) => {
    const response = await client.get('/login').redirects(0)
    response.assertStatus(302)
    response.assertHeader('location', '/signup')
  })

  test('anyone can sign up and gets a workspace of their own', async ({ client, assert }) => {
    const { workspace } = await createMember()

    const response = await client
      .post('/signup')
      .withCsrfToken()
      .form({
        companyName: 'Atelier Ngono',
        email: 'Paul@Example.com',
        password: 'secret-password',
        passwordConfirmation: 'secret-password',
      })
      .redirects(0)

    response.assertStatus(302)
    response.assertHeader('location', '/settings')

    const paul = await User.findByOrFail('email', 'paul@example.com')
    await paul.load('workspace')
    assert.notEqual(paul.workspaceId, workspace.id)
    assert.equal(paul.workspace.name, 'Atelier Ngono')

    const settings = await SettingsService.all(paul.workspaceId)
    assert.equal(settings.senderName, 'Atelier Ngono')
    assert.equal(settings.senderEmail, 'paul@example.com')
  })

  test('a member never reaches the data of another workspace', async ({ client, assert }) => {
    const { workspace } = await createMember('owner@example.com', 'Boutique')
    const { user: stranger } = await createMember('stranger@example.com', 'Concurrent')

    const contact = await Contact.create({
      workspaceId: workspace.id,
      email: 'awa@example.com',
      status: 'subscribed',
      source: 'manual',
    })
    const campaign = await Campaign.create({
      workspaceId: workspace.id,
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

    const list = await client.get('/contacts').loginAs(stranger).withInertia()
    assert.lengthOf(list.inertiaProps.contacts as unknown[], 0)

    const show = await client.get(`/contacts/${contact.id}`).loginAs(stranger)
    show.assertStatus(404)

    const edit = await client.get(`/campaigns/${campaign.id}/edit`).loginAs(stranger)
    edit.assertStatus(404)

    const remove = await client
      .post('/contacts/bulk')
      .loginAs(stranger)
      .withCsrfToken()
      .json({ ids: [contact.id], action: 'delete' })
      .redirects(0)
    remove.assertStatus(302)
    assert.isNotNull(await Contact.find(contact.id))

    const exported = await client.get('/contacts/export').loginAs(stranger)
    assert.notInclude(exported.text(), 'awa@example.com')
  })

  test('the same person can be a contact of two workspaces', async ({ client, assert }) => {
    const { user: owner } = await createMember('owner@example.com', 'Boutique')
    const { user: other } = await createMember('other@example.com', 'Atelier')

    for (const user of [owner, other]) {
      const response = await client
        .post('/contacts')
        .loginAs(user)
        .withCsrfToken()
        .form({ email: 'awa@example.com', status: 'subscribed' })
        .redirects(0)
      response.assertStatus(302)
    }

    assert.lengthOf(await Contact.query().where('email', 'awa@example.com'), 2)
  })

  test('saving a campaign or a contact keeps only the lists of the workspace', async ({
    client,
    assert,
  }) => {
    const { user, workspace } = await createMember('owner@example.com', 'Boutique')
    const { workspace: other } = await createMember('other@example.com', 'Atelier')
    const own = await List.create({ workspaceId: workspace.id, name: 'Clients' })
    const foreign = await List.create({ workspaceId: other.id, name: 'Prospects' })
    const listIds = [own.id, foreign.id]

    const campaign = await Campaign.create({
      workspaceId: workspace.id,
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
    const saveCampaign = await client
      .put(`/campaigns/${campaign.id}`)
      .loginAs(user)
      .withCsrfToken()
      .json({
        name: 'Soldes',
        subject: 'Soldes',
        fromName: 'Boutique',
        fromEmail: 'shop@example.com',
        editor: 'visual',
        body: '<p>Bonjour</p>',
        listIds,
        trackOpens: true,
        trackClicks: true,
      })
      .redirects(0)
    saveCampaign.assertStatus(302)
    await campaign.load('lists')
    assert.deepEqual(
      campaign.lists.map((list) => list.id),
      [own.id]
    )

    const contact = await Contact.create({
      workspaceId: workspace.id,
      email: 'awa@example.com',
      status: 'subscribed',
      source: 'manual',
    })
    const saveContact = await client
      .put(`/contacts/${contact.id}`)
      .loginAs(user)
      .withCsrfToken()
      .json({ email: 'awa@example.com', status: 'subscribed', listIds })
      .redirects(0)
    saveContact.assertStatus(302)
    await contact.load('lists')
    assert.deepEqual(
      contact.lists.map((list) => list.id),
      [own.id]
    )
  })

  test('a teammate joins the workspace of the member who adds them', async ({ client, assert }) => {
    const { user, workspace } = await createMember()

    await client
      .post('/settings/team')
      .loginAs(user)
      .withCsrfToken()
      .form({ email: 'camille@example.com', password: 'secret-password' })
      .redirects(0)

    const camille = await User.findByOrFail('email', 'camille@example.com')
    assert.equal(camille.workspaceId, workspace.id)
  })

  test('a member can export the contacts as CSV', async ({ client, assert }) => {
    const { user, workspace } = await createMember()
    await Contact.create({
      workspaceId: workspace.id,
      email: 'awa@example.com',
      firstName: 'Awa',
      status: 'subscribed',
      source: 'manual',
      attributes: { ville: 'Douala' },
    })

    const response = await client.get('/contacts/export').loginAs(user)
    response.assertStatus(200)
    assert.include(response.header('content-type'), 'text/csv')
    assert.include(response.text(), 'awa@example.com;Awa')
    assert.include(response.text(), 'ville')
    assert.include(response.text(), 'Douala')
  })
})
