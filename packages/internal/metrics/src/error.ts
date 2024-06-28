import { errorBoundary } from './utils/errorBoundary';
import { track, TrackProperties } from './track';

type ErrorEventProperties =
  | TrackProperties & {
    isTrackError?: never;
    errorMessage?: never;
    errorStack?: never;
  };

const trackErrorFn = (
  moduleName: string,
  eventName: string,
  error: Error,
  properties?: ErrorEventProperties,
) => {
  const { message } = error;
  let stack = error.stack || '';
  const { cause } = error;

  if (cause instanceof Error) {
    stack = `${stack} \nCause: ${cause.message}\n ${cause.stack}`;
  }

  track(moduleName, `trackError_${eventName}`, {
    ...(properties || {}),
    errorMessage: message,
    errorStack: stack,
    isTrackError: true,
  });
};

/**
 * Track an event and it's performance. Works similarly to `track`, but also includes a duration.
 * @param moduleName Name of the module being tracked (for namespacing purposes), e.g. `passport`
 * @param eventName Name of the event, e.g. `clickItem`
 * @param error Error object to be tracked
 * @param properties Other properties to be sent with the event, other than duration
 *
 * @example
 * ```ts
 * trackError("passport", "sendTransactionFailed", error);
 * trackError("passport", "getItemFailed", error, { otherProperty: "value" });
 * ```
 */
export const trackError = errorBoundary(trackErrorFn);
