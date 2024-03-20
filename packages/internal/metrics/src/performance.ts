import { errorBoundary } from 'utils/errorBoundary';
import { track, TrackProperties } from './track';

type PerformanceEventProperties =
  | (TrackProperties & {
    duration: never;
  })
  | undefined;

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
  properties?: PerformanceEventProperties,
) => track(moduleName, eventName, {
  ...(properties || {}),
  duration,
});

// Time Tracking Functions
// -----------------------------------

// Write a function to take multiple objects as arguments, and merge them into one object
const mergeProperties = (...args: (Record<string, any> | undefined)[]) => {
  const hasProperties = args.some((arg) => !!arg);
  if (!hasProperties) {
    return undefined;
  }
  let finalProperties: Record<string, any> = {};
  args.forEach((arg) => {
    if (arg) {
      finalProperties = {
        ...finalProperties,
        ...arg,
      };
    }
  });

  return finalProperties;
};

const getEventName = (flowName: string, eventName: string) => `${flowName}_${eventName}`;

// Generate a random uuid
const generateFlowId = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};

type FlowEventProperties = PerformanceEventProperties & {
  flowId: never;
  flowStartTime: never;
};

const trackFlowFn = (
  moduleName: string,
  flowName: string,
  properties?: FlowEventProperties,
) => {
  // Track the start of the flow
  const flowStartEventName = getEventName(flowName, 'start');
  const flowId = generateFlowId();
  const startTime = performance.now();
  const flowStartTime = startTime + performance.timeOrigin;

  let flowProperties = mergeProperties(properties, {
    flowId,
    flowStartTime,
  }) as FlowEventProperties;
  trackDuration(moduleName, flowStartEventName, 0, flowProperties);

  const addFlowProperties = (newProperties: FlowEventProperties) => {
    flowProperties = mergeProperties(flowProperties, newProperties, {
      flowId,
      flowStartTime,
    }) as FlowEventProperties;
  };

  const addEvent = (
    eventName: string,
    eventProperties?: FlowEventProperties,
  ) => {
    const event = getEventName(flowName, eventName);

    // Calculate time since start
    const duration = Math.round(performance.now() - startTime);
    // Always send the details of the startFlow props with all events in the flow
    const mergedProps = mergeProperties(flowProperties, eventProperties, {
      flowId,
      flowStartTime,
      duration,
    }) as FlowEventProperties;
    trackDuration(moduleName, event, duration, mergedProps);
  };

  const end = (endProperties?: FlowEventProperties) => {
    // Track the end of the flow
    const flowEndEventName = getEventName(flowName, 'end');
    const duration = Math.round(performance.now() - startTime);
    const mergedProps = mergeProperties(flowProperties, endProperties, {
      flowId,
      flowStartTime,
    }) as FlowEventProperties;
    trackDuration(moduleName, flowEndEventName, duration, mergedProps);
  };

  return {
    details: {
      moduleName,
      flowName,
      flowId,
      flowStartTime,
    },
    addEvent: errorBoundary(addEvent),
    addFlowProperties: errorBoundary(addFlowProperties),
    end: errorBoundary(end),
  };
};

/**
 * Track a flow of events, including the start and end of the flow.
 * Works similarly to `track`
 * @param moduleName Name of the module being tracked (for namespacing purposes), e.g. `passport`
 * @param flowName Name of the flow, e.g. `performTransaction`
 * @param properties Other properties to be sent with the event, other than duration
 *
 * @example
 * ```ts
 * const flow = trackFlow("passport", "performTransaction", { transationType: "transfer" });
 * // Do something...
 * flow.addEvent("clickItem");
 * // Do something...
 * flow.addFlowProperties({ item: "item1" });
 * flow.addEvent("guardianCheck");
 * // Do something...
 * flow.addEvent("guardianCheckComplete");
 * flow.end();
 * ```
 */
export const trackFlow = errorBoundary(trackFlowFn);
