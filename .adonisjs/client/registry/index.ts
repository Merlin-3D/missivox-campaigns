/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

export type { Route, Path } from './schema.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [[0,"/"]],
    types: placeholder as Registry['home']['types'],
  },
  'health': {
    methods: ["GET","HEAD"],
    pattern: '/health',
    tokens: [[0,"health"]],
    types: placeholder as Registry['health']['types'],
  },
  'tracking.open': {
    methods: ["GET","HEAD"],
    pattern: '/t/o/:token',
    tokens: [[0,"t"],[0,"o"],[1,"token"]],
    types: placeholder as Registry['tracking.open']['types'],
  },
  'tracking.click': {
    methods: ["GET","HEAD"],
    pattern: '/t/c/:token/:link',
    tokens: [[0,"t"],[0,"c"],[1,"token"],[1,"link"]],
    types: placeholder as Registry['tracking.click']['types'],
  },
  'tracking.web_version': {
    methods: ["GET","HEAD"],
    pattern: '/m/:token',
    tokens: [[0,"m"],[1,"token"]],
    types: placeholder as Registry['tracking.web_version']['types'],
  },
  'unsubscribe.show': {
    methods: ["GET","HEAD"],
    pattern: '/u/:token',
    tokens: [[0,"u"],[1,"token"]],
    types: placeholder as Registry['unsubscribe.show']['types'],
  },
  'unsubscribe.store': {
    methods: ["POST"],
    pattern: '/u/:token',
    tokens: [[0,"u"],[1,"token"]],
    types: placeholder as Registry['unsubscribe.store']['types'],
  },
  'unsubscribe.destroy': {
    methods: ["DELETE"],
    pattern: '/u/:token',
    tokens: [[0,"u"],[1,"token"]],
    types: placeholder as Registry['unsubscribe.destroy']['types'],
  },
  'new_account.create': {
    methods: ["GET","HEAD"],
    pattern: '/signup',
    tokens: [[0,"signup"]],
    types: placeholder as Registry['new_account.create']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/signup',
    tokens: [[0,"signup"]],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'session.create': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [[0,"login"]],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [[0,"login"]],
    types: placeholder as Registry['session.store']['types'],
  },
  'dashboard': {
    methods: ["GET","HEAD"],
    pattern: '/dashboard',
    tokens: [[0,"dashboard"]],
    types: placeholder as Registry['dashboard']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [[0,"logout"]],
    types: placeholder as Registry['session.destroy']['types'],
  },
  'contact_imports.create': {
    methods: ["GET","HEAD"],
    pattern: '/contacts/import',
    tokens: [[0,"contacts"],[0,"import"]],
    types: placeholder as Registry['contact_imports.create']['types'],
  },
  'contact_imports.store': {
    methods: ["POST"],
    pattern: '/contacts/import',
    tokens: [[0,"contacts"],[0,"import"]],
    types: placeholder as Registry['contact_imports.store']['types'],
  },
  'contacts.export': {
    methods: ["GET","HEAD"],
    pattern: '/contacts/export',
    tokens: [[0,"contacts"],[0,"export"]],
    types: placeholder as Registry['contacts.export']['types'],
  },
  'contacts.bulk': {
    methods: ["POST"],
    pattern: '/contacts/bulk',
    tokens: [[0,"contacts"],[0,"bulk"]],
    types: placeholder as Registry['contacts.bulk']['types'],
  },
  'contacts.index': {
    methods: ["GET","HEAD"],
    pattern: '/contacts',
    tokens: [[0,"contacts"]],
    types: placeholder as Registry['contacts.index']['types'],
  },
  'contacts.create': {
    methods: ["GET","HEAD"],
    pattern: '/contacts/create',
    tokens: [[0,"contacts"],[0,"create"]],
    types: placeholder as Registry['contacts.create']['types'],
  },
  'contacts.store': {
    methods: ["POST"],
    pattern: '/contacts',
    tokens: [[0,"contacts"]],
    types: placeholder as Registry['contacts.store']['types'],
  },
  'contacts.show': {
    methods: ["GET","HEAD"],
    pattern: '/contacts/:id',
    tokens: [[0,"contacts"],[1,"id"]],
    types: placeholder as Registry['contacts.show']['types'],
  },
  'contacts.edit': {
    methods: ["GET","HEAD"],
    pattern: '/contacts/:id/edit',
    tokens: [[0,"contacts"],[1,"id"],[0,"edit"]],
    types: placeholder as Registry['contacts.edit']['types'],
  },
  'contacts.update': {
    methods: ["PUT","PATCH"],
    pattern: '/contacts/:id',
    tokens: [[0,"contacts"],[1,"id"]],
    types: placeholder as Registry['contacts.update']['types'],
  },
  'contacts.destroy': {
    methods: ["DELETE"],
    pattern: '/contacts/:id',
    tokens: [[0,"contacts"],[1,"id"]],
    types: placeholder as Registry['contacts.destroy']['types'],
  },
  'lists.index': {
    methods: ["GET","HEAD"],
    pattern: '/lists',
    tokens: [[0,"lists"]],
    types: placeholder as Registry['lists.index']['types'],
  },
  'lists.store': {
    methods: ["POST"],
    pattern: '/lists',
    tokens: [[0,"lists"]],
    types: placeholder as Registry['lists.store']['types'],
  },
  'lists.update': {
    methods: ["PUT","PATCH"],
    pattern: '/lists/:id',
    tokens: [[0,"lists"],[1,"id"]],
    types: placeholder as Registry['lists.update']['types'],
  },
  'lists.destroy': {
    methods: ["DELETE"],
    pattern: '/lists/:id',
    tokens: [[0,"lists"],[1,"id"]],
    types: placeholder as Registry['lists.destroy']['types'],
  },
  'templates.index': {
    methods: ["GET","HEAD"],
    pattern: '/templates',
    tokens: [[0,"templates"]],
    types: placeholder as Registry['templates.index']['types'],
  },
  'templates.create': {
    methods: ["GET","HEAD"],
    pattern: '/templates/create',
    tokens: [[0,"templates"],[0,"create"]],
    types: placeholder as Registry['templates.create']['types'],
  },
  'templates.store': {
    methods: ["POST"],
    pattern: '/templates',
    tokens: [[0,"templates"]],
    types: placeholder as Registry['templates.store']['types'],
  },
  'templates.edit': {
    methods: ["GET","HEAD"],
    pattern: '/templates/:id/edit',
    tokens: [[0,"templates"],[1,"id"],[0,"edit"]],
    types: placeholder as Registry['templates.edit']['types'],
  },
  'templates.update': {
    methods: ["PUT","PATCH"],
    pattern: '/templates/:id',
    tokens: [[0,"templates"],[1,"id"]],
    types: placeholder as Registry['templates.update']['types'],
  },
  'templates.destroy': {
    methods: ["DELETE"],
    pattern: '/templates/:id',
    tokens: [[0,"templates"],[1,"id"]],
    types: placeholder as Registry['templates.destroy']['types'],
  },
  'templates.duplicate': {
    methods: ["POST"],
    pattern: '/templates/:id/duplicate',
    tokens: [[0,"templates"],[1,"id"],[0,"duplicate"]],
    types: placeholder as Registry['templates.duplicate']['types'],
  },
  'campaigns.index': {
    methods: ["GET","HEAD"],
    pattern: '/campaigns',
    tokens: [[0,"campaigns"]],
    types: placeholder as Registry['campaigns.index']['types'],
  },
  'campaigns.create': {
    methods: ["GET","HEAD"],
    pattern: '/campaigns/create',
    tokens: [[0,"campaigns"],[0,"create"]],
    types: placeholder as Registry['campaigns.create']['types'],
  },
  'campaigns.store': {
    methods: ["POST"],
    pattern: '/campaigns',
    tokens: [[0,"campaigns"]],
    types: placeholder as Registry['campaigns.store']['types'],
  },
  'campaigns.show': {
    methods: ["GET","HEAD"],
    pattern: '/campaigns/:id',
    tokens: [[0,"campaigns"],[1,"id"]],
    types: placeholder as Registry['campaigns.show']['types'],
  },
  'campaigns.edit': {
    methods: ["GET","HEAD"],
    pattern: '/campaigns/:id/edit',
    tokens: [[0,"campaigns"],[1,"id"],[0,"edit"]],
    types: placeholder as Registry['campaigns.edit']['types'],
  },
  'campaigns.update': {
    methods: ["PUT","PATCH"],
    pattern: '/campaigns/:id',
    tokens: [[0,"campaigns"],[1,"id"]],
    types: placeholder as Registry['campaigns.update']['types'],
  },
  'campaigns.destroy': {
    methods: ["DELETE"],
    pattern: '/campaigns/:id',
    tokens: [[0,"campaigns"],[1,"id"]],
    types: placeholder as Registry['campaigns.destroy']['types'],
  },
  'campaigns.duplicate': {
    methods: ["POST"],
    pattern: '/campaigns/:id/duplicate',
    tokens: [[0,"campaigns"],[1,"id"],[0,"duplicate"]],
    types: placeholder as Registry['campaigns.duplicate']['types'],
  },
  'campaign_actions.test': {
    methods: ["POST"],
    pattern: '/campaigns/:id/test',
    tokens: [[0,"campaigns"],[1,"id"],[0,"test"]],
    types: placeholder as Registry['campaign_actions.test']['types'],
  },
  'campaign_actions.schedule': {
    methods: ["POST"],
    pattern: '/campaigns/:id/schedule',
    tokens: [[0,"campaigns"],[1,"id"],[0,"schedule"]],
    types: placeholder as Registry['campaign_actions.schedule']['types'],
  },
  'campaign_actions.unschedule': {
    methods: ["POST"],
    pattern: '/campaigns/:id/unschedule',
    tokens: [[0,"campaigns"],[1,"id"],[0,"unschedule"]],
    types: placeholder as Registry['campaign_actions.unschedule']['types'],
  },
  'campaign_actions.pause': {
    methods: ["POST"],
    pattern: '/campaigns/:id/pause',
    tokens: [[0,"campaigns"],[1,"id"],[0,"pause"]],
    types: placeholder as Registry['campaign_actions.pause']['types'],
  },
  'campaign_actions.resume': {
    methods: ["POST"],
    pattern: '/campaigns/:id/resume',
    tokens: [[0,"campaigns"],[1,"id"],[0,"resume"]],
    types: placeholder as Registry['campaign_actions.resume']['types'],
  },
  'campaign_actions.cancel': {
    methods: ["POST"],
    pattern: '/campaigns/:id/cancel',
    tokens: [[0,"campaigns"],[1,"id"],[0,"cancel"]],
    types: placeholder as Registry['campaign_actions.cancel']['types'],
  },
  'previews.campaign': {
    methods: ["GET","HEAD"],
    pattern: '/campaigns/:id/preview',
    tokens: [[0,"campaigns"],[1,"id"],[0,"preview"]],
    types: placeholder as Registry['previews.campaign']['types'],
  },
  'previews.render': {
    methods: ["POST"],
    pattern: '/preview',
    tokens: [[0,"preview"]],
    types: placeholder as Registry['previews.render']['types'],
  },
  'settings.edit': {
    methods: ["GET","HEAD"],
    pattern: '/settings',
    tokens: [[0,"settings"]],
    types: placeholder as Registry['settings.edit']['types'],
  },
  'settings.update': {
    methods: ["PUT"],
    pattern: '/settings',
    tokens: [[0,"settings"]],
    types: placeholder as Registry['settings.update']['types'],
  },
  'settings.update_smtp': {
    methods: ["PUT"],
    pattern: '/settings/smtp',
    tokens: [[0,"settings"],[0,"smtp"]],
    types: placeholder as Registry['settings.update_smtp']['types'],
  },
  'settings.destroy_smtp': {
    methods: ["DELETE"],
    pattern: '/settings/smtp',
    tokens: [[0,"settings"],[0,"smtp"]],
    types: placeholder as Registry['settings.destroy_smtp']['types'],
  },
  'settings.test_smtp': {
    methods: ["POST"],
    pattern: '/settings/smtp-test',
    tokens: [[0,"settings"],[0,"smtp-test"]],
    types: placeholder as Registry['settings.test_smtp']['types'],
  },
  'team.index': {
    methods: ["GET","HEAD"],
    pattern: '/settings/team',
    tokens: [[0,"settings"],[0,"team"]],
    types: placeholder as Registry['team.index']['types'],
  },
  'team.store': {
    methods: ["POST"],
    pattern: '/settings/team',
    tokens: [[0,"settings"],[0,"team"]],
    types: placeholder as Registry['team.store']['types'],
  },
  'team.destroy': {
    methods: ["DELETE"],
    pattern: '/settings/team/:id',
    tokens: [[0,"settings"],[0,"team"],[1,"id"]],
    types: placeholder as Registry['team.destroy']['types'],
  },
  'team.update_password': {
    methods: ["PUT"],
    pattern: '/settings/password',
    tokens: [[0,"settings"],[0,"password"]],
    types: placeholder as Registry['team.update_password']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
