import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class CampaignsWork extends BaseCommand {
  static commandName = 'campaigns:work'
  static description = 'Send the queued campaign emails (run it when CAMPAIGN_WORKER=false)'

  static options: CommandOptions = {
    startApp: true,
    staysAlive: true,
  }

  async run() {
    const { default: CampaignWorker } = await import('#services/campaign_worker')
    const worker = new CampaignWorker()

    this.app.terminating(() => worker.stop())
    this.app.listen('SIGINT', () => this.app.terminate())
    this.app.listen('SIGTERM', () => this.app.terminate())

    worker.start()
    this.logger.info('Sending worker is running. Press Ctrl+C to stop.')
  }
}
