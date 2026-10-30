import vine from '@vinejs/vine'
import { CONTACT_STATUSES } from '#database/enums'

const optionalText = (max: number) => vine.string().trim().maxLength(max).nullable().optional()

/**
 * Creating or updating a contact. Emails are unique within a workspace;
 * the id of the edited contact is passed so its own email does not count
 * as a duplicate.
 */
export const contactValidator = vine
  .withMetaData<{ contactId: number | null; workspaceId: number }>()
  .create({
    email: vine
      .string()
      .trim()
      .toLowerCase()
      .email()
      .maxLength(254)
      .unique({
        table: 'contacts',
        column: 'email',
        filter: (query, _, field) => {
          query.where('workspace_id', field.meta.workspaceId)
          if (field.meta.contactId) query.whereNot('id', field.meta.contactId)
        },
      }),
    firstName: optionalText(100),
    lastName: optionalText(100),
    company: optionalText(150),
    phone: optionalText(40),
    status: vine.enum(CONTACT_STATUSES),
    listIds: vine.array(vine.number().withoutDecimals()).optional(),
    attributes: vine
      .array(
        vine.object({
          name: vine.string().trim().maxLength(60),
          value: vine.string().trim().maxLength(500),
        })
      )
      .optional(),
  })

export const bulkContactsValidator = vine.create({
  ids: vine.array(vine.number().withoutDecimals()).minLength(1),
  action: vine.enum(['delete', 'add_to_list', 'remove_from_list', 'unsubscribe', 'resubscribe']),
  listId: vine
    .number()
    .withoutDecimals()
    .optional()
    .requiredWhen('action', 'in', ['add_to_list', 'remove_from_list']),
})

export const importContactsValidator = vine.create({
  file: vine.file({ size: '20mb', extnames: ['csv', 'txt'] }),
  listIds: vine.array(vine.number().withoutDecimals()).optional(),
  updateExisting: vine.boolean().optional(),
})

export const contactFiltersValidator = vine.create({
  q: vine.string().trim().maxLength(200).nullable().optional(),
  status: vine.enum(CONTACT_STATUSES).nullable().optional(),
  list: vine.number().withoutDecimals().nullable().optional(),
  page: vine.number().withoutDecimals().min(1).nullable().optional(),
})
