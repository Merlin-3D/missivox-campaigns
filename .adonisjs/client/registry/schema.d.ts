/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractRawResponse, ExtractResponse, Method, PathWithRegistry, PatternsByMethod, RouteWithRegistry } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'
import type { routes } from './index.ts'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
      rawResponse: ExtractRawResponse<unknown>
    }
  }
  'health': {
    methods: ["GET","HEAD"]
    pattern: '/health'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
      rawResponse: ExtractRawResponse<unknown>
    }
  }
  'tracking.open': {
    methods: ["GET","HEAD"]
    pattern: '/t/o/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tracking_controller').default['open']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tracking_controller').default['open']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/tracking_controller').default['open']>>>
    }
  }
  'tracking.click': {
    methods: ["GET","HEAD"]
    pattern: '/t/c/:token/:link'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { token: ParamValue; link: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tracking_controller').default['click']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tracking_controller').default['click']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/tracking_controller').default['click']>>>
    }
  }
  'tracking.web_version': {
    methods: ["GET","HEAD"]
    pattern: '/m/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/tracking_controller').default['webVersion']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/tracking_controller').default['webVersion']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/tracking_controller').default['webVersion']>>>
    }
  }
  'unsubscribe.show': {
    methods: ["GET","HEAD"]
    pattern: '/u/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/unsubscribe_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/unsubscribe_controller').default['show']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/unsubscribe_controller').default['show']>>>
    }
  }
  'unsubscribe.store': {
    methods: ["POST"]
    pattern: '/u/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/unsubscribe_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/unsubscribe_controller').default['store']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/unsubscribe_controller').default['store']>>>
    }
  }
  'unsubscribe.destroy': {
    methods: ["DELETE"]
    pattern: '/u/:token'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { token: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/unsubscribe_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/unsubscribe_controller').default['destroy']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/unsubscribe_controller').default['destroy']>>>
    }
  }
  'new_account.create': {
    methods: ["GET","HEAD"]
    pattern: '/signup'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['create']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['create']>>>
    }
  }
  'new_account.store': {
    methods: ["POST"]
    pattern: '/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'session.create': {
    methods: ["GET","HEAD"]
    pattern: '/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/session_controller').default['create']>>>
    }
  }
  'session.store': {
    methods: ["POST"]
    pattern: '/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/session_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['index']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/dashboard_controller').default['index']>>>
    }
  }
  'session.destroy': {
    methods: ["POST"]
    pattern: '/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/session_controller').default['destroy']>>>
    }
  }
  'contact_imports.create': {
    methods: ["GET","HEAD"]
    pattern: '/contacts/import'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contact_imports_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contact_imports_controller').default['create']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/contact_imports_controller').default['create']>>>
    }
  }
  'contact_imports.store': {
    methods: ["POST"]
    pattern: '/contacts/import'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/contact').importContactsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/contact').importContactsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contact_imports_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contact_imports_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/contact_imports_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'contacts.export': {
    methods: ["GET","HEAD"]
    pattern: '/contacts/export'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/contact').contactFiltersValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['export']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['export']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['export']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'contacts.bulk': {
    methods: ["POST"]
    pattern: '/contacts/bulk'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/contact').bulkContactsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/contact').bulkContactsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['bulk']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['bulk']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['bulk']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'contacts.index': {
    methods: ["GET","HEAD"]
    pattern: '/contacts'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/contact').contactFiltersValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'contacts.create': {
    methods: ["GET","HEAD"]
    pattern: '/contacts/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['create']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['create']>>>
    }
  }
  'contacts.store': {
    methods: ["POST"]
    pattern: '/contacts'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/contact').contactValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/contact').contactValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'contacts.show': {
    methods: ["GET","HEAD"]
    pattern: '/contacts/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['show']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['show']>>>
    }
  }
  'contacts.edit': {
    methods: ["GET","HEAD"]
    pattern: '/contacts/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['edit']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['edit']>>>
    }
  }
  'contacts.update': {
    methods: ["PUT","PATCH"]
    pattern: '/contacts/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/contact').contactValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/contact').contactValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'contacts.destroy': {
    methods: ["DELETE"]
    pattern: '/contacts/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['destroy']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/contacts_controller').default['destroy']>>>
    }
  }
  'lists.index': {
    methods: ["GET","HEAD"]
    pattern: '/lists'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/lists_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/lists_controller').default['index']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/lists_controller').default['index']>>>
    }
  }
  'lists.store': {
    methods: ["POST"]
    pattern: '/lists'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/list').listValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/list').listValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/lists_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/lists_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/lists_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'lists.update': {
    methods: ["PUT","PATCH"]
    pattern: '/lists/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/list').listValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/list').listValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/lists_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/lists_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/lists_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'lists.destroy': {
    methods: ["DELETE"]
    pattern: '/lists/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/lists_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/lists_controller').default['destroy']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/lists_controller').default['destroy']>>>
    }
  }
  'templates.index': {
    methods: ["GET","HEAD"]
    pattern: '/templates'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/templates_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/templates_controller').default['index']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/templates_controller').default['index']>>>
    }
  }
  'templates.create': {
    methods: ["GET","HEAD"]
    pattern: '/templates/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/templates_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/templates_controller').default['create']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/templates_controller').default['create']>>>
    }
  }
  'templates.store': {
    methods: ["POST"]
    pattern: '/templates'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/template').templateValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/template').templateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/templates_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/templates_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/templates_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'templates.edit': {
    methods: ["GET","HEAD"]
    pattern: '/templates/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/templates_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/templates_controller').default['edit']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/templates_controller').default['edit']>>>
    }
  }
  'templates.update': {
    methods: ["PUT","PATCH"]
    pattern: '/templates/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/template').templateValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/template').templateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/templates_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/templates_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/templates_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'templates.destroy': {
    methods: ["DELETE"]
    pattern: '/templates/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/templates_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/templates_controller').default['destroy']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/templates_controller').default['destroy']>>>
    }
  }
  'templates.duplicate': {
    methods: ["POST"]
    pattern: '/templates/:id/duplicate'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/templates_controller').default['duplicate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/templates_controller').default['duplicate']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/templates_controller').default['duplicate']>>>
    }
  }
  'campaigns.index': {
    methods: ["GET","HEAD"]
    pattern: '/campaigns'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['index']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['index']>>>
    }
  }
  'campaigns.create': {
    methods: ["GET","HEAD"]
    pattern: '/campaigns/create'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['create']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['create']>>>
    }
  }
  'campaigns.store': {
    methods: ["POST"]
    pattern: '/campaigns'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/campaign').createCampaignValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/campaign').createCampaignValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'campaigns.show': {
    methods: ["GET","HEAD"]
    pattern: '/campaigns/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/campaign').recipientFiltersValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['show']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'campaigns.edit': {
    methods: ["GET","HEAD"]
    pattern: '/campaigns/:id/edit'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['edit']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['edit']>>>
    }
  }
  'campaigns.update': {
    methods: ["PUT","PATCH"]
    pattern: '/campaigns/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/campaign').updateCampaignValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/campaign').updateCampaignValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'campaigns.destroy': {
    methods: ["DELETE"]
    pattern: '/campaigns/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['destroy']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['destroy']>>>
    }
  }
  'campaigns.duplicate': {
    methods: ["POST"]
    pattern: '/campaigns/:id/duplicate'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['duplicate']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['duplicate']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/campaigns_controller').default['duplicate']>>>
    }
  }
  'campaign_actions.test': {
    methods: ["POST"]
    pattern: '/campaigns/:id/test'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/campaign').testCampaignValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/campaign').testCampaignValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaign_actions_controller').default['test']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaign_actions_controller').default['test']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/campaign_actions_controller').default['test']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'campaign_actions.schedule': {
    methods: ["POST"]
    pattern: '/campaigns/:id/schedule'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/campaign').scheduleCampaignValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/campaign').scheduleCampaignValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaign_actions_controller').default['schedule']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaign_actions_controller').default['schedule']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/campaign_actions_controller').default['schedule']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'campaign_actions.unschedule': {
    methods: ["POST"]
    pattern: '/campaigns/:id/unschedule'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaign_actions_controller').default['unschedule']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaign_actions_controller').default['unschedule']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/campaign_actions_controller').default['unschedule']>>>
    }
  }
  'campaign_actions.pause': {
    methods: ["POST"]
    pattern: '/campaigns/:id/pause'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaign_actions_controller').default['pause']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaign_actions_controller').default['pause']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/campaign_actions_controller').default['pause']>>>
    }
  }
  'campaign_actions.resume': {
    methods: ["POST"]
    pattern: '/campaigns/:id/resume'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaign_actions_controller').default['resume']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaign_actions_controller').default['resume']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/campaign_actions_controller').default['resume']>>>
    }
  }
  'campaign_actions.cancel': {
    methods: ["POST"]
    pattern: '/campaigns/:id/cancel'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/campaign_actions_controller').default['cancel']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/campaign_actions_controller').default['cancel']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/campaign_actions_controller').default['cancel']>>>
    }
  }
  'previews.campaign': {
    methods: ["GET","HEAD"]
    pattern: '/campaigns/:id/preview'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/previews_controller').default['campaign']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/previews_controller').default['campaign']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/previews_controller').default['campaign']>>>
    }
  }
  'previews.render': {
    methods: ["POST"]
    pattern: '/preview'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/template').previewValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/template').previewValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/previews_controller').default['render']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/previews_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/previews_controller').default['render']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings.edit': {
    methods: ["GET","HEAD"]
    pattern: '/settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['edit']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['edit']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['edit']>>>
    }
  }
  'settings.update': {
    methods: ["PUT"]
    pattern: '/settings'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/settings').settingsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/settings').settingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings.update_smtp': {
    methods: ["PUT"]
    pattern: '/settings/smtp'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/settings').smtpValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/settings').smtpValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['updateSmtp']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['updateSmtp']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['updateSmtp']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings.destroy_smtp': {
    methods: ["DELETE"]
    pattern: '/settings/smtp'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['destroySmtp']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['destroySmtp']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['destroySmtp']>>>
    }
  }
  'settings.test_smtp': {
    methods: ["POST"]
    pattern: '/settings/smtp-test'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/settings').smtpTestValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/settings').smtpTestValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['testSmtp']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['testSmtp']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['testSmtp']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'team.index': {
    methods: ["GET","HEAD"]
    pattern: '/settings/team'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/team_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/team_controller').default['index']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/team_controller').default['index']>>>
    }
  }
  'team.store': {
    methods: ["POST"]
    pattern: '/settings/team'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/settings').teamMemberValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/settings').teamMemberValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/team_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/team_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/team_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'team.destroy': {
    methods: ["DELETE"]
    pattern: '/settings/team/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/team_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/team_controller').default['destroy']>>>
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/team_controller').default['destroy']>>>
    }
  }
  'team.update_password': {
    methods: ["PUT"]
    pattern: '/settings/password'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/settings').passwordValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/settings').passwordValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/team_controller').default['updatePassword']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/team_controller').default['updatePassword']>>> | { status: 422; response: { errors: SimpleError[] } }
      rawResponse: ExtractRawResponse<Awaited<ReturnType<import('#controllers/team_controller').default['updatePassword']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
}

export namespace Route {
  export type Request<Name extends keyof typeof routes> = RouteWithRegistry.Request<typeof routes, Name>
  export type Response<Name extends keyof typeof routes> = RouteWithRegistry.Response<typeof routes, Name>
  export type Params<Name extends keyof typeof routes> = RouteWithRegistry.Params<typeof routes, Name>
  export type Body<Name extends keyof typeof routes> = RouteWithRegistry.Body<typeof routes, Name>
  export type Query<Name extends keyof typeof routes> = RouteWithRegistry.Query<typeof routes, Name>
  export type Error<Name extends keyof typeof routes> = RouteWithRegistry.Error<typeof routes, Name>
}

export namespace Path {
  export type Request<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Request<typeof routes, M, P>
  export type Response<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Response<typeof routes, M, P>
  export type Params<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Params<typeof routes, M, P>
  export type Body<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Body<typeof routes, M, P>
  export type Query<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Query<typeof routes, M, P>
  export type Error<M extends Method, P extends PatternsByMethod<typeof routes, M>> =
    PathWithRegistry.Error<typeof routes, M, P>
}
