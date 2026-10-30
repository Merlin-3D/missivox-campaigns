import { WorkerStateSchema } from '#database/schema'

export default class WorkerState extends WorkerStateSchema {
  static table = 'worker_states'
  static selfAssignPrimaryKey = true
}
