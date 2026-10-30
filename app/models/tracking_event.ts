import { TrackingEventSchema } from '#database/schema'

export default class TrackingEvent extends TrackingEventSchema {
  static table = 'tracking_events'
}
