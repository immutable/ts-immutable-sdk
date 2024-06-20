import { errorBoundary } from 'utils/errorBoundary';
import { v4 as uuid } from 'uuid';
import { track, TrackProperties } from './track';

type PerformanceEventProperties = TrackProperties & {
  duration?: never;
};

export type Flow = {
  details: {
    moduleName: string;
    flowName: string;
    flowId: string;
  };
  addEvent: (
    eventName: string,
    properties?: PerformanceEventProperties,
  ) => void;
  addFlowProperties: (properties: PerformanceEventProperties) => void;
};

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
  duration: Math.round(duration),
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

// Used the get the name of the event
const getEventName = (flowName: string, eventName: string) => `${flowName}_${eventName}`;

// Generate a random uuid
const generateFlowId = () => uuid();

type FlowEventProperties = PerformanceEventProperties & {
  flowId?: never;
  flowName?: never;
  flowCurrentEvent?: never;
  flowPreviousEvent?: never;
  flowEventHistory?: never;
  flowCurrentStep?: never;
};

const trackFlowFn = (
  moduleName: string,
  flowName: string,
  properties?: FlowEventProperties,
): Flow => {
  // Track the start of the flow
  const flowId = generateFlowId();
  let flowProperties = mergeProperties(properties, {
    flowId,
    flowName,
  }) as FlowEventProperties;

  // Flow Senkey items, default to empty values
  let flowPreviousEvent: string = '';
  let flowPreviousTimestamp: number = 0;
  const flowEventHistory: string[] = [];
  let flowCurrentStep = 0;

  const mergeFlowProperties = (...args: (TrackProperties | undefined)[]) => mergeProperties(...args, {
    // Don't want to allow overwriting the flowId or flowName
    flowId,
    flowName,
  }) as FlowEventProperties;

  // Function to add global properties to the flow
  // These properties will be sent along with all subsequent events in the flow
  const addFlowProperties = (newProperties: FlowEventProperties) => {
    flowProperties = mergeFlowProperties(flowProperties, newProperties);
  };

  const addEvent = (
    eventName: string,
    eventProperties?: FlowEventProperties,
  ) => {
    const event = getEventName(flowName, eventName);

    const currentTime = performance.now();
    flowEventHistory.push(eventName);
    flowCurrentStep += 1;

    // Calculate time since previous event
    let duration = 0;

    // If not the first event in flow, calculate the duration
    if (flowPreviousTimestamp !== 0) {
      duration = currentTime - flowPreviousTimestamp;
    }

    // Always send the details of the startFlow props with all events in the flow
    // Allow flow properties to be overwritten by event properties
    // Always end with properties that shouldn't be overwritten
    const mergedProps = mergeFlowProperties(flowProperties, eventProperties, {
      flowCurrentEvent: eventName,
      flowPreviousEvent,
      flowEventHistory,
      flowCurrentStep,
    });
    trackDuration(moduleName, event, duration, mergedProps);

    // Update the previous event and timestamp
    flowPreviousEvent = eventName;
    flowPreviousTimestamp = currentTime;
  };

  // Start tracking now with Start Event
  addEvent('Start');

  return {
    details: {
      moduleName,
      flowName,
      flowId,
    },
    addEvent: errorBoundary(addEvent),
    addFlowProperties: errorBoundary(addFlowProperties),
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
 * const flow = trackFlow("passport", "Perform Transaction", { transationType: "transfer" });
 * // Do something...
 * flow.addEvent("Click Item");
 * // Do something...
 * flow.addFlowProperties({ item: "item1" });
 * flow.addEvent("Guardian Check", {"invisible": "true"});
 * // Do something...
 * flow.addEvent("guardianCheckComplete");
 * ```
 */
export const trackFlow = errorBoundary(trackFlowFn);
