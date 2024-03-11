import { errorBoundary } from 'utils/errorBoundary';
import { memorise } from 'lru-memorise';
import { getGlobalisedValue } from 'utils/globalise';
import { track } from './track';

type PerformanceEventProperties = Record<string, string | number | boolean> & {
  duration: never;
};

/**
 * Track an event and it's performance. Works similarly to `track`, but also includes a duration.
 * @param moduleName Name of the module being tracked (for namespacing purposes), e.g. `passport`
 * @param eventName Name of the event, e.g. `clickItem`
 * @param duration Duration of the event in milliseconds, e.g. `1000`
 * @param properties Other properties to be sent with the event, other than duration
 *
 * e.g.
 * ```ts
 * trackDuration("passport", "performTransaction", 1000);
 * trackDuration("passport", "performTransaction", 1000, { transationType: "transfer" });
 * ```
 */
export const trackDuration = (
  moduleName: string,
  eventName: string,
  duration: number,
  properties?: PerformanceEventProperties,
) => track(moduleName, eventName, {
  ...(properties || {}),
  duration,
});

// Time Tracking Functions
// -----------------------------------

// Retrieving a cache for closures.
type CacheReturn = {
  startTime: number;
  endFn: (endProperties?: PerformanceEventProperties) => void;
};
// eslint-disable-next-line no-underscore-dangle
const measureCache = memorise(() => ({}) as CacheReturn)._cache;

// Standardise the measure name
const getMeasureName = (moduleName: string, eventName: string) => `${moduleName}.${eventName}`;

const mergeProperties = (
  startProperties?: PerformanceEventProperties,
  endProperties?: PerformanceEventProperties,
) => {
  const hasProperties = startProperties || endProperties;
  if (!hasProperties) {
    return undefined;
  }
  return {
    // Order matters, end properties can override start properties
    ...(startProperties || {}),
    ...(endProperties || {}),
  } as PerformanceEventProperties;
};

// Function that creates a start mark for performance tracking for an event
const trackStartFn = (
  moduleName: string,
  eventName: string,
  properties?: PerformanceEventProperties,
) => {
  const measure = getMeasureName(moduleName, eventName);

  const startTime = performance.now();

  // This is a closure, so it can be called later to track the end of the event.
  // This is the ideal use, better than using the cache.
  const endFn = (endProperties?: PerformanceEventProperties) => {
    // If we don't clear the cache, it might eject other closures from the cache
    // Should we clear the cache?
    if (measureCache.has(measure)) {
      const existingEnd = measureCache.get(measure)!;
      // If cached end is the same as the current end, clear from cache
      if (existingEnd.startTime === startTime) {
        measureCache.delete(measure);
      }
    }

    // Calculate duration
    const duration = Math.round(performance.now() - startTime);

    // Merge properties
    const mergedProperties = mergeProperties(properties, endProperties);

    // Call track duration
    trackDuration(moduleName, eventName, duration, mergedProperties);
  };

  // If performance mark is called multiple times, it will override the previous one.
  // So, we need to keep the original closure time, and properties if it's not ended.
  if (!measureCache.has(measure)) {
    measureCache.set(measure, { startTime, endFn });
  }

  return endFn;
};

/**
 * Helper function that returns a funtion to be called at the end mark, to track the duration of an event.
 * @param moduleName Name of the module being tracked (for namespacing purposes), e.g. `passport`
 * @param eventName Name of the event, e.g. `clickItem`
 * @param properties Properties to be sent with the event
 * @returns TrackEnd function, to be called at the end mark.
 *
 * e.g.
 * ```ts
 * const trackEnd = trackStart("passport", "performTransaction");
 * // ... do somethings that you want to track
 * trackEnd();
 * ```
 *
 * e.g. with properties
 * ```ts
 * const trackEnd = trackStart("passport", "performTransaction", { transationType: "transfer" });
 * // ... do somethings that you want to track
 * trackEnd({ transactionStatus: "success" });
 * ```
 * In the above example, the properties are merged into the final event.
 *
 */
export const trackStart = errorBoundary(
  getGlobalisedValue('trackStart', trackStartFn),
);

const trackEndFn = (
  moduleName: string,
  eventName: string,
  properties?: PerformanceEventProperties,
) => {
  const measure = getMeasureName(moduleName, eventName);
  if (!measureCache.has(measure)) {
    // This doesn't have a start mark, so it can't be ended.
    return;
  }

  const { endFn } = measureCache.get(measure)!;
  endFn(properties);

  // Clean up the cache
  measureCache.delete(measure);
};

/**
 * Function that tracks a previously started measure (with `trackStart`)
 * @param moduleName Name of the module being tracked (for namespacing purposes), e.g. `passport`
 * @param eventName Name of the event, e.g. `clickItem`
 * @param properties Properties to be sent with the event
 *
 * e.g.
 * ```ts
 * trackStart('passport', 'doThing') // Note, not using return value
 * // ...do thing
 * trackEnd('passport', 'doThing')
 * ```
 *
 * e.g. with properties
 * ```ts
 * // Note, not using return value
 * trackStart('passport', 'doThing', {transactionType: 'something'})
 * // ...do thing
 * trackEnd('passport', 'doThing', {succeeded: true})
 * ```
 */
export const endTrack = errorBoundary(
  getGlobalisedValue('trackEnd', trackEndFn),
);
