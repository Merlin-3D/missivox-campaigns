import { DateTime } from 'luxon'
import Setting from '#models/setting'
import WorkerState from '#models/worker_state'

const HEARTBEAT_KEY = 'heartbeat'
const ERROR_KEY = 'sending.error'

/**
 * A worker that did not report for this long is considered stopped.
 */
const ALIVE_WITHIN_SECONDS = 60

export type WorkerHealth = {
  alive: boolean
  lastBeatAt: string | null
  error: { message: string; at: string } | null
}

/**
 * Health of the sending worker, stored in the database so the web server
 * can report on a worker running in another process. The worker is shared
 * by all workspaces; sending errors (a refused SMTP server) belong to the
 * workspace whose server failed.
 */
export default class WorkerStatus {
  static async beat() {
    await WorkerState.updateOrCreate({ key: HEARTBEAT_KEY }, { value: DateTime.now().toISO() })
  }

  static async reportError(workspaceId: number, message: string) {
    await Setting.updateOrCreate(
      { workspaceId, key: ERROR_KEY },
      { value: { message, at: DateTime.now().toISO() } }
    )
  }

  static async clearError(workspaceId: number) {
    await Setting.query().where('workspace_id', workspaceId).where('key', ERROR_KEY).delete()
  }

  static async get(workspaceId: number): Promise<WorkerHealth> {
    const state = await WorkerState.find(HEARTBEAT_KEY)
    const error = await Setting.query()
      .where('workspace_id', workspaceId)
      .where('key', ERROR_KEY)
      .first()
    const heartbeat: string | null = state?.value ?? null
    const lastBeat = heartbeat ? DateTime.fromISO(heartbeat) : null

    return {
      alive: !!lastBeat && DateTime.now().diff(lastBeat, 'seconds').seconds < ALIVE_WITHIN_SECONDS,
      lastBeatAt: heartbeat,
      error: error?.value ?? null,
    }
  }
}
