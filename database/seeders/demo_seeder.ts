import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import List from '#models/list'
import Contact from '#models/contact'
import Template from '#models/template'
import Workspace from '#models/workspace'
import SettingsService from '#services/settings_service'
import { addContactsToLists } from '#services/contact_importer'

/**
 * Demo data for local development: "node ace db:seed".
 * Never run it against a production database.
 */
export default class DemoSeeder extends BaseSeeder {
  static environment = ['development', 'testing']

  async run() {
    const workspace = await Workspace.firstOrCreate({ name: 'Boutique Exemple' })
    const workspaceId = workspace.id

    await User.updateOrCreate(
      { email: 'demo@missivox.test' },
      { workspaceId, fullName: 'Camille Démo', password: 'missive-demo-2026' }
    )
    await SettingsService.update(workspaceId, {
      senderName: 'Boutique Exemple',
      senderEmail: 'bonjour@boutique-exemple.test',
      companyName: 'Boutique Exemple',
      companyAddress: '12 rue des Lilas, 69001 Lyon',
    })

    const clients = await List.firstOrCreate(
      { workspaceId, name: 'Clients' },
      { description: 'Clients ayant déjà acheté' }
    )
    const newsletter = await List.firstOrCreate(
      { workspaceId, name: 'Newsletter' },
      { description: 'Inscrits depuis le site' }
    )

    const people = [
      ['awa.diallo@example.com', 'Awa', 'Diallo', 'Diallo Import', 'Dakar'],
      ['paul.ngono@example.com', 'Paul', 'Ngono', 'Ngono & Fils', 'Douala'],
      ['marie.dupont@example.com', 'Marie', 'Dupont', null, 'Lyon'],
      ['jean.martin@example.com', 'Jean', 'Martin', 'Martin SARL', 'Paris'],
      ['fatou.sow@example.com', 'Fatou', 'Sow', null, 'Abidjan'],
      ['lucas.bernard@example.com', 'Lucas', 'Bernard', 'Bernard Conseil', 'Bordeaux'],
    ] as const

    const contacts: Contact[] = []
    for (const [email, firstName, lastName, company, city] of people) {
      contacts.push(
        await Contact.updateOrCreate(
          { workspaceId, email },
          {
            firstName,
            lastName,
            company,
            attributes: { ville: city },
            status: 'subscribed',
            source: 'manual',
          }
        )
      )
    }

    await addContactsToLists(
      contacts.slice(0, 4).map((contact) => contact.id),
      [clients.id]
    )
    await addContactsToLists(
      contacts.slice(2).map((contact) => contact.id),
      [newsletter.id]
    )

    await Template.firstOrCreate(
      { workspaceId, name: 'Newsletter mensuelle' },
      {
        subject: 'Les nouveautés de {{ company | "la boutique" }}',
        editor: 'visual',
        body: `<h1>Bonjour {{ first_name | "à vous" }},</h1>
<p>Voici ce qui a changé ce mois-ci chez nous.</p>
<h2>Nouveautés</h2>
<ul><li>Livraison offerte dès 50 €</li><li>Un nouveau service client, joignable 7 jours sur 7</li></ul>
<p><a href="https://example.com/nouveautes">Tout découvrir</a></p>
<p>À très vite,<br>L'équipe</p>`,
      }
    )
  }
}
