import { readFile } from 'node:fs/promises'
import List from '#models/list'
import { importContacts } from '#services/contact_importer'
import ListTransformer from '#transformers/list_transformer'
import { importContactsValidator } from '#validators/contact'
import type { HttpContext } from '@adonisjs/core/http'

export default class ContactImportsController {
  async create({ inertia, request, auth }: HttpContext) {
    const lists = await List.ofWorkspace(auth.user!.workspaceId).orderBy('name')
    const listId = Number(request.qs().list) || null

    return inertia.render('contacts/import', {
      lists: ListTransformer.transform(lists),
      preselectedListId: listId,
      summary: null,
    })
  }

  async store({ request, inertia, session, response, auth }: HttpContext) {
    const { workspaceId } = auth.user!
    const { file, listIds, updateExisting } = await request.validateUsing(importContactsValidator)

    const content = await readFile(file.tmpPath!, 'utf8')
    const lists = await List.ofWorkspace(workspaceId).orderBy('name')

    try {
      const summary = await importContacts(content, {
        workspaceId,
        listIds: await List.ownedIds(workspaceId, listIds),
        updateExisting: updateExisting ?? false,
      })

      return inertia.render('contacts/import', {
        lists: ListTransformer.transform(lists),
        preselectedListId: null,
        summary,
      })
    } catch (error) {
      session.flash('error', error instanceof Error ? error.message : "L'import a échoué.")
      return response.redirect().back()
    }
  }
}
