import List from '#models/list'
import { listValidator } from '#validators/list'
import ListTransformer from '#transformers/list_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class ListsController {
  async index({ inertia, auth }: HttpContext) {
    const lists = await List.ofWorkspace(auth.user!.workspaceId)
      .withCount('contacts')
      .withCount('contacts', (query) => query.where('status', 'subscribed').as('subscribed_count'))
      .orderBy('name')

    return inertia.render('lists/index', {
      lists: ListTransformer.transform(lists).useVariant('withCounts'),
    })
  }

  async store({ request, response, session, auth }: HttpContext) {
    const data = await request.validateUsing(listValidator)
    const list = await List.create({ ...data, workspaceId: auth.user!.workspaceId })

    session.flash('success', `La liste « ${list.name} » a été créée.`)
    return response.redirect().toRoute('lists.index')
  }

  async update({ params, request, response, session, auth }: HttpContext) {
    const list = await List.ofWorkspace(auth.user!.workspaceId).where('id', params.id).firstOrFail()
    list.merge(await request.validateUsing(listValidator))
    await list.save()

    session.flash('success', 'La liste a été mise à jour.')
    return response.redirect().toRoute('lists.index')
  }

  /**
   * Deleting a list keeps its contacts: they only leave the list.
   */
  async destroy({ params, response, session, auth }: HttpContext) {
    const list = await List.ofWorkspace(auth.user!.workspaceId).where('id', params.id).firstOrFail()
    await list.delete()

    session.flash(
      'success',
      `La liste « ${list.name} » a été supprimée. Ses contacts sont conservés.`
    )
    return response.redirect().toRoute('lists.index')
  }
}
