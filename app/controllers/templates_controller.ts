import Template from '#models/template'
import { templateValidator } from '#validators/template'
import TemplateTransformer from '#transformers/template_transformer'
import { STARTER_BODY } from '#services/starter_content'
import type { HttpContext } from '@adonisjs/core/http'

export default class TemplatesController {
  async index({ inertia, auth }: HttpContext) {
    const templates = await Template.ofWorkspace(auth.user!.workspaceId).orderBy(
      'updated_at',
      'desc'
    )
    return inertia.render('templates/index', {
      templates: TemplateTransformer.transform(templates).useVariant('summary'),
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('templates/form', {
      template: null,
      starterBody: STARTER_BODY,
    })
  }

  async store({ request, response, session, auth }: HttpContext) {
    const template = await Template.create({
      ...(await request.validateUsing(templateValidator)),
      workspaceId: auth.user!.workspaceId,
    })

    session.flash('success', `Le modèle « ${template.name} » a été créé.`)
    return response.redirect().toRoute('templates.edit', { id: template.id })
  }

  async edit({ params, inertia, auth }: HttpContext) {
    const template = await Template.findOwnedOrFail(auth.user!.workspaceId, params.id)
    return inertia.render('templates/form', {
      template: TemplateTransformer.transform(template),
      starterBody: STARTER_BODY,
    })
  }

  async update({ params, request, response, session, auth }: HttpContext) {
    const template = await Template.findOwnedOrFail(auth.user!.workspaceId, params.id)
    template.merge(await request.validateUsing(templateValidator))
    await template.save()

    session.flash('success', 'Le modèle a été enregistré.')
    return response.redirect().toRoute('templates.edit', { id: template.id })
  }

  async duplicate({ params, response, session, auth }: HttpContext) {
    const template = await Template.findOwnedOrFail(auth.user!.workspaceId, params.id)
    const copy = await Template.create({
      workspaceId: template.workspaceId,
      name: `${template.name} (copie)`,
      subject: template.subject,
      editor: template.editor,
      body: template.body,
    })

    session.flash('success', 'Le modèle a été dupliqué.')
    return response.redirect().toRoute('templates.edit', { id: copy.id })
  }

  async destroy({ params, response, session, auth }: HttpContext) {
    const template = await Template.findOwnedOrFail(auth.user!.workspaceId, params.id)
    await template.delete()

    session.flash('success', `Le modèle « ${template.name} » a été supprimé.`)
    return response.redirect().toRoute('templates.index')
  }
}
