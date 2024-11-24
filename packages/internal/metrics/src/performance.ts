import { track, AllowedTrackProperties } from './track';

/**
 * Track an event and it's performance. Works similarly to `track`, but also includes a duration.
 * @param moduleName Name of the module being tracked (for namespacing purposes), e.g. `passport`
 * @param eventName Name of the event, e.g. `clickItem`
 * @param duration Duration of the event in milliseconds, e.g. `1000`
 * @param properties Other properties to be sent with the event, other than duration
 *
 * @example
 * ```ts
 * trackDuration("passport", "performTransaction", 1000);
 * trackDuration("passport", "performTransaction", 1000, { transationType: "transfer" });
 * ```
 */
export const trackDuration = (
  moduleName: string,
  eventName: string,
  duration: number,
  properties?: AllowedTrackProperties,
) => track(moduleName, eventName, {
  ...(properties || {}),
  duration: Math.round(duration),
});
