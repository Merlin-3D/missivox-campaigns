/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  health: typeof routes['health']
  tracking: {
    open: typeof routes['tracking.open']
    click: typeof routes['tracking.click']
    webVersion: typeof routes['tracking.web_version']
  }
  unsubscribe: {
    show: typeof routes['unsubscribe.show']
    store: typeof routes['unsubscribe.store']
    destroy: typeof routes['unsubscribe.destroy']
  }
  newAccount: {
    create: typeof routes['new_account.create']
    store: typeof routes['new_account.store']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    destroy: typeof routes['session.destroy']
  }
  dashboard: typeof routes['dashboard']
  contactImports: {
    create: typeof routes['contact_imports.create']
    store: typeof routes['contact_imports.store']
  }
  contacts: {
    export: typeof routes['contacts.export']
    bulk: typeof routes['contacts.bulk']
    index: typeof routes['contacts.index']
    create: typeof routes['contacts.create']
    store: typeof routes['contacts.store']
    show: typeof routes['contacts.show']
    edit: typeof routes['contacts.edit']
    update: typeof routes['contacts.update']
    destroy: typeof routes['contacts.destroy']
  }
  lists: {
    index: typeof routes['lists.index']
    store: typeof routes['lists.store']
    update: typeof routes['lists.update']
    destroy: typeof routes['lists.destroy']
  }
  templates: {
    index: typeof routes['templates.index']
    create: typeof routes['templates.create']
    store: typeof routes['templates.store']
    edit: typeof routes['templates.edit']
    update: typeof routes['templates.update']
    destroy: typeof routes['templates.destroy']
    duplicate: typeof routes['templates.duplicate']
  }
  campaigns: {
    index: typeof routes['campaigns.index']
    create: typeof routes['campaigns.create']
    store: typeof routes['campaigns.store']
    show: typeof routes['campaigns.show']
    edit: typeof routes['campaigns.edit']
    update: typeof routes['campaigns.update']
    destroy: typeof routes['campaigns.destroy']
    duplicate: typeof routes['campaigns.duplicate']
  }
  campaignActions: {
    test: typeof routes['campaign_actions.test']
    schedule: typeof routes['campaign_actions.schedule']
    unschedule: typeof routes['campaign_actions.unschedule']
    pause: typeof routes['campaign_actions.pause']
    resume: typeof routes['campaign_actions.resume']
    cancel: typeof routes['campaign_actions.cancel']
  }
  previews: {
    campaign: typeof routes['previews.campaign']
    render: typeof routes['previews.render']
  }
  settings: {
    edit: typeof routes['settings.edit']
    update: typeof routes['settings.update']
    updateSmtp: typeof routes['settings.update_smtp']
    destroySmtp: typeof routes['settings.destroy_smtp']
    testSmtp: typeof routes['settings.test_smtp']
  }
  team: {
    index: typeof routes['team.index']
    store: typeof routes['team.store']
    destroy: typeof routes['team.destroy']
    updatePassword: typeof routes['team.update_password']
  }
}
