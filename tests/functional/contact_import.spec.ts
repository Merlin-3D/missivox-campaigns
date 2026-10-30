import { test } from '@japa/runner'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import testUtils from '@adonisjs/core/services/test_utils'
import List from '#models/list'
import Contact from '#models/contact'
import { createMember } from '#tests/helpers'

async function csvFile(content: string) {
  const directory = await mkdtemp(join(tmpdir(), 'missivox-'))
  const path = join(directory, 'contacts.csv')
  await writeFile(path, content)
  return path
}

test.group('Contact import', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('imports a CSV, updates existing contacts and fills the list', async ({
    client,
    assert,
  }) => {
    const { user, workspace } = await createMember()
    const list = await List.create({ workspaceId: workspace.id, name: 'Clients' })
    await Contact.create({
      workspaceId: workspace.id,
      email: 'paul@example.com',
      firstName: 'Paul',
      status: 'unsubscribed',
      source: 'manual',
    })

    const file = await csvFile(
      'email;prenom;nom;ville\nawa@example.com;Awa;Diallo;Dakar\nPAUL@example.com;Paul;Ngono;\nnope;;;'
    )

    const response = await client
      .post('/contacts/import')
      .loginAs(user)
      .withCsrfToken()
      .withInertia()
      .file('file', file)
      .field('listIds[0]', String(list.id))
      .field('updateExisting', '1')

    response.assertStatus(200)
    response.assertInertiaComponent('contacts/import')
    const summary = response.inertiaProps.summary as Record<string, any>
    assert.equal(summary.created, 1)
    assert.equal(summary.updated, 1)
    assert.lengthOf(summary.invalid, 1)

    const awa = await Contact.findByOrFail('email', 'awa@example.com')
    assert.equal(awa.source, 'import')
    assert.deepEqual(awa.attributes, { ville: 'Dakar' })

    const paul = await Contact.findByOrFail('email', 'paul@example.com')
    assert.equal(paul.lastName, 'Ngono')
    assert.equal(paul.status, 'unsubscribed', 'an import never resubscribes a contact')

    await list.load('contacts')
    assert.sameMembers(
      list.contacts.map((contact) => contact.email),
      ['awa@example.com', 'paul@example.com']
    )
  })
})
