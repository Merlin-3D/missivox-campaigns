import { DateTime } from 'luxon'
import { stringify } from 'csv-stringify/sync'
import db from '@adonisjs/lucid/services/db'
import Contact from '#models/contact'
import List from '#models/list'
import CampaignRecipient from '#models/campaign_recipient'
import { sqlDate } from '#services/sql_date'
import { addContactsToLists } from '#services/contact_importer'
import ContactTransformer from '#transformers/contact_transformer'
import ListTransformer from '#transformers/list_transformer'
import {
  bulkContactsValidator,
  contactFiltersValidator,
  contactValidator,
} from '#validators/contact'
import type { HttpContext } from '@adonisjs/core/http'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

const PER_PAGE = 25

type Filters = { q?: string | null; status?: Contact['status'] | null; list?: number | null }

function applyFilters(query: ModelQueryBuilderContract<typeof Contact>, filters: Filters) {
  if (filters.q) {
    const term = `%${filters.q.toLowerCase()}%`
    query.where((builder) => {
      builder
        .whereRaw('lower(email) LIKE ?', [term])
        .orWhereRaw('lower(first_name) LIKE ?', [term])
        .orWhereRaw('lower(last_name) LIKE ?', [term])
        .orWhereRaw('lower(company) LIKE ?', [term])
    })
  }
  if (filters.status) {
    query.where('status', filters.status)
  }
  if (filters.list) {
    query.whereHas('lists', (lists) => lists.where('lists.id', filters.list!))
  }
  return query
}

/**
 * Turns the attributes edited as rows in the form back into an object.
 */
function attributesFromRows(rows: { name: string; value: string }[] | undefined) {
  if (!rows) return undefined
  const attributes = Object.fromEntries(
    rows.filter((row) => row.name && row.value).map((row) => [row.name, row.value])
  )
  return Object.keys(attributes).length ? attributes : null
}

export default class ContactsController {
  async index({ request, inertia, auth }: HttpContext) {
    const { workspaceId } = auth.user!
    const filters = await request.validateUsing(contactFiltersValidator, {
      data: request.qs(),
    })

    const paginator = await applyFilters(Contact.ofWorkspace(workspaceId), filters)
      .preload('lists')
      .orderBy('created_at', 'desc')
      .orderBy('id', 'desc')
      .paginate(filters.page ?? 1, PER_PAGE)

    const lists = await List.ofWorkspace(workspaceId).orderBy('name')

    return inertia.render('contacts/index', {
      contacts: ContactTransformer.transform(paginator.all()),
      meta: {
        total: paginator.total,
        currentPage: paginator.currentPage,
        lastPage: paginator.lastPage,
        perPage: paginator.perPage,
      },
      filters: {
        q: filters.q ?? '',
        status: filters.status ?? '',
        list: filters.list ?? null,
      },
      lists: ListTransformer.transform(lists),
    })
  }

  async create({ inertia, auth }: HttpContext) {
    const lists = await List.ofWorkspace(auth.user!.workspaceId).orderBy('name')
    return inertia.render('contacts/form', {
      contact: null,
      lists: ListTransformer.transform(lists),
    })
  }

  async store({ request, response, session, auth }: HttpContext) {
    const { workspaceId } = auth.user!
    const { listIds, attributes, ...data } = await request.validateUsing(contactValidator, {
      meta: { contactId: null, workspaceId },
    })
    const ownListIds = await List.ownedIds(workspaceId, listIds)

    const contact = await db.transaction(async (trx) => {
      const created = await Contact.create(
        {
          ...data,
          workspaceId,
          attributes: attributesFromRows(attributes) ?? null,
          source: 'manual',
          unsubscribedAt: data.status === 'unsubscribed' ? DateTime.now() : null,
        },
        { client: trx }
      )
      if (ownListIds.length) await created.related('lists').attach(ownListIds)
      return created
    })

    session.flash('success', `${contact.email} a été ajouté.`)
    return response.redirect().toRoute('contacts.show', { id: contact.id })
  }

  async show({ params, inertia, auth }: HttpContext) {
    const contact = await Contact.ofWorkspace(auth.user!.workspaceId)
      .where('id', params.id)
      .preload('lists')
      .firstOrFail()

    const deliveries = await CampaignRecipient.query()
      .where('contact_id', contact.id)
      .preload('campaign')
      .orderBy('id', 'desc')
      .limit(50)

    return inertia.render('contacts/show', {
      contact: ContactTransformer.transform(contact),
      deliveries: deliveries.map((delivery) => ({
        id: delivery.id,
        campaignId: delivery.campaignId,
        campaignName: delivery.campaign.name,
        status: delivery.status,
        sentAt: delivery.sentAt?.toISO() ?? null,
        openedAt: delivery.openedAt?.toISO() ?? null,
        openCount: delivery.openCount,
        clickedAt: delivery.clickedAt?.toISO() ?? null,
        clickCount: delivery.clickCount,
        unsubscribedAt: delivery.unsubscribedAt?.toISO() ?? null,
      })),
    })
  }

  async edit({ params, inertia, auth }: HttpContext) {
    const { workspaceId } = auth.user!
    const contact = await Contact.ofWorkspace(workspaceId)
      .where('id', params.id)
      .preload('lists')
      .firstOrFail()
    const lists = await List.ofWorkspace(workspaceId).orderBy('name')

    return inertia.render('contacts/form', {
      contact: ContactTransformer.transform(contact),
      lists: ListTransformer.transform(lists),
    })
  }

  async update({ params, request, response, session, auth }: HttpContext) {
    const { workspaceId } = auth.user!
    const contact = await Contact.ofWorkspace(workspaceId).where('id', params.id).firstOrFail()
    const { listIds, attributes, ...data } = await request.validateUsing(contactValidator, {
      meta: { contactId: contact.id, workspaceId },
    })

    if (data.status === 'unsubscribed' && contact.status !== 'unsubscribed') {
      contact.unsubscribedAt = DateTime.now()
    } else if (data.status === 'subscribed') {
      contact.unsubscribedAt = null
    }

    const ownListIds = listIds ? await List.ownedIds(workspaceId, listIds) : null

    await db.transaction(async (trx) => {
      contact.useTransaction(trx)
      contact.merge({ ...data, attributes: attributesFromRows(attributes) ?? null })
      await contact.save()
      if (ownListIds) await contact.related('lists').sync(ownListIds)
    })

    session.flash('success', 'Le contact a été mis à jour.')
    return response.redirect().toRoute('contacts.show', { id: contact.id })
  }

  async destroy({ params, response, session, auth }: HttpContext) {
    const contact = await Contact.ofWorkspace(auth.user!.workspaceId)
      .where('id', params.id)
      .firstOrFail()
    await contact.delete()

    session.flash('success', `${contact.email} a été supprimé.`)
    return response.redirect().toRoute('contacts.index')
  }

  async bulk({ request, response, session, auth }: HttpContext) {
    const { workspaceId } = auth.user!
    const input = await request.validateUsing(bulkContactsValidator)
    const { action, listId } = input
    const owned = await Contact.ofWorkspace(workspaceId).whereIn('id', input.ids).select('id')
    const ids = owned.map((contact) => contact.id)
    if (listId) await List.ofWorkspace(workspaceId).where('id', listId).firstOrFail()

    const count = ids.length
    const label = count > 1 ? `${count} contacts` : '1 contact'

    switch (action) {
      case 'delete':
        await Contact.ofWorkspace(workspaceId).whereIn('id', ids).delete()
        session.flash('success', `${label} supprimé(s).`)
        break
      case 'add_to_list':
        await addContactsToLists(ids, [listId!])
        session.flash('success', `${label} ajouté(s) à la liste.`)
        break
      case 'remove_from_list':
        await db.from('contact_list').where('list_id', listId!).whereIn('contact_id', ids).delete()
        session.flash('success', `${label} retiré(s) de la liste.`)
        break
      case 'unsubscribe':
        await Contact.ofWorkspace(workspaceId)
          .whereIn('id', ids)
          .where('status', 'subscribed')
          .update({ status: 'unsubscribed', unsubscribed_at: sqlDate() })
        session.flash('success', `${label} désinscrit(s).`)
        break
      case 'resubscribe':
        await Contact.ofWorkspace(workspaceId)
          .whereIn('id', ids)
          .update({ status: 'subscribed', unsubscribed_at: null })
        session.flash('success', `${label} réinscrit(s).`)
        break
    }

    return response.redirect().back()
  }

  /**
   * Downloads the filtered contacts as a CSV file that can be imported back.
   */
  async export({ request, response, auth }: HttpContext) {
    const filters = await request.validateUsing(contactFiltersValidator, { data: request.qs() })
    const contacts = await applyFilters(Contact.ofWorkspace(auth.user!.workspaceId), filters)
      .preload('lists')
      .orderBy('id')

    const attributeNames = [
      ...new Set(contacts.flatMap((contact) => Object.keys(contact.attributes ?? {}))),
    ]
    const rows = contacts.map((contact) => [
      contact.email,
      contact.firstName ?? '',
      contact.lastName ?? '',
      contact.company ?? '',
      contact.phone ?? '',
      contact.status,
      contact.lists.map((list) => list.name).join(' | '),
      contact.createdAt.toISODate() ?? '',
      ...attributeNames.map((name) => contact.attributes?.[name] ?? ''),
    ])

    const csv = stringify(
      [
        [
          'email',
          'prenom',
          'nom',
          'entreprise',
          'telephone',
          'statut',
          'listes',
          'cree_le',
          ...attributeNames,
        ],
        ...rows,
      ],
      { delimiter: ';' }
    )

    response.header('Content-Type', 'text/csv; charset=utf-8')
    response.header(
      'Content-Disposition',
      `attachment; filename="contacts-${DateTime.now().toFormat('yyyy-MM-dd')}.csv"`
    )
    return '\uFEFF' + csv
  }
}
