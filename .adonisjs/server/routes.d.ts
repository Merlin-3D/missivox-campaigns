import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'health': { paramsTuple?: []; params?: {} }
    'tracking.open': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'tracking.click': { paramsTuple: [ParamValue,ParamValue]; params: {'token': ParamValue,'link': ParamValue} }
    'tracking.web_version': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'unsubscribe.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'unsubscribe.store': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'unsubscribe.destroy': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'contact_imports.create': { paramsTuple?: []; params?: {} }
    'contact_imports.store': { paramsTuple?: []; params?: {} }
    'contacts.export': { paramsTuple?: []; params?: {} }
    'contacts.bulk': { paramsTuple?: []; params?: {} }
    'contacts.index': { paramsTuple?: []; params?: {} }
    'contacts.create': { paramsTuple?: []; params?: {} }
    'contacts.store': { paramsTuple?: []; params?: {} }
    'contacts.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'contacts.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'contacts.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'contacts.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'lists.index': { paramsTuple?: []; params?: {} }
    'lists.store': { paramsTuple?: []; params?: {} }
    'lists.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'lists.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'templates.index': { paramsTuple?: []; params?: {} }
    'templates.create': { paramsTuple?: []; params?: {} }
    'templates.store': { paramsTuple?: []; params?: {} }
    'templates.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'templates.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'templates.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'templates.duplicate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.index': { paramsTuple?: []; params?: {} }
    'campaigns.create': { paramsTuple?: []; params?: {} }
    'campaigns.store': { paramsTuple?: []; params?: {} }
    'campaigns.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.duplicate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaign_actions.test': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaign_actions.schedule': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaign_actions.unschedule': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaign_actions.pause': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaign_actions.resume': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaign_actions.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'previews.campaign': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'previews.render': { paramsTuple?: []; params?: {} }
    'settings.edit': { paramsTuple?: []; params?: {} }
    'settings.update': { paramsTuple?: []; params?: {} }
    'settings.update_smtp': { paramsTuple?: []; params?: {} }
    'settings.destroy_smtp': { paramsTuple?: []; params?: {} }
    'settings.test_smtp': { paramsTuple?: []; params?: {} }
    'team.index': { paramsTuple?: []; params?: {} }
    'team.store': { paramsTuple?: []; params?: {} }
    'team.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'team.update_password': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'health': { paramsTuple?: []; params?: {} }
    'tracking.open': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'tracking.click': { paramsTuple: [ParamValue,ParamValue]; params: {'token': ParamValue,'link': ParamValue} }
    'tracking.web_version': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'unsubscribe.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'contact_imports.create': { paramsTuple?: []; params?: {} }
    'contacts.export': { paramsTuple?: []; params?: {} }
    'contacts.index': { paramsTuple?: []; params?: {} }
    'contacts.create': { paramsTuple?: []; params?: {} }
    'contacts.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'contacts.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'lists.index': { paramsTuple?: []; params?: {} }
    'templates.index': { paramsTuple?: []; params?: {} }
    'templates.create': { paramsTuple?: []; params?: {} }
    'templates.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.index': { paramsTuple?: []; params?: {} }
    'campaigns.create': { paramsTuple?: []; params?: {} }
    'campaigns.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'previews.campaign': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'settings.edit': { paramsTuple?: []; params?: {} }
    'team.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'health': { paramsTuple?: []; params?: {} }
    'tracking.open': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'tracking.click': { paramsTuple: [ParamValue,ParamValue]; params: {'token': ParamValue,'link': ParamValue} }
    'tracking.web_version': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'unsubscribe.show': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'contact_imports.create': { paramsTuple?: []; params?: {} }
    'contacts.export': { paramsTuple?: []; params?: {} }
    'contacts.index': { paramsTuple?: []; params?: {} }
    'contacts.create': { paramsTuple?: []; params?: {} }
    'contacts.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'contacts.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'lists.index': { paramsTuple?: []; params?: {} }
    'templates.index': { paramsTuple?: []; params?: {} }
    'templates.create': { paramsTuple?: []; params?: {} }
    'templates.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.index': { paramsTuple?: []; params?: {} }
    'campaigns.create': { paramsTuple?: []; params?: {} }
    'campaigns.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.edit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'previews.campaign': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'settings.edit': { paramsTuple?: []; params?: {} }
    'team.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'unsubscribe.store': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'contact_imports.store': { paramsTuple?: []; params?: {} }
    'contacts.bulk': { paramsTuple?: []; params?: {} }
    'contacts.store': { paramsTuple?: []; params?: {} }
    'lists.store': { paramsTuple?: []; params?: {} }
    'templates.store': { paramsTuple?: []; params?: {} }
    'templates.duplicate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.store': { paramsTuple?: []; params?: {} }
    'campaigns.duplicate': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaign_actions.test': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaign_actions.schedule': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaign_actions.unschedule': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaign_actions.pause': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaign_actions.resume': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaign_actions.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'previews.render': { paramsTuple?: []; params?: {} }
    'settings.test_smtp': { paramsTuple?: []; params?: {} }
    'team.store': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'unsubscribe.destroy': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'contacts.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'lists.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'templates.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'settings.destroy_smtp': { paramsTuple?: []; params?: {} }
    'team.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'contacts.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'lists.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'templates.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'settings.update': { paramsTuple?: []; params?: {} }
    'settings.update_smtp': { paramsTuple?: []; params?: {} }
    'team.update_password': { paramsTuple?: []; params?: {} }
  }
  PATCH: {
    'contacts.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'lists.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'templates.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'campaigns.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}