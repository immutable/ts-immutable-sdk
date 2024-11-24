import { AllowedTrackProperties, TrackProperties } from './track';
import { errorBoundary } from './utils/errorBoundary';
import { generateFlowId } from './utils/id';
import { trackDuration } from './performance';

export type Flow = {
  details: {
    moduleName: string;
    flowName: string;
    flowId: string;
    flowStartTime: number;
  };
  /**
   * Track an event in the flow
   * @param eventName Name of the event
   * @param properties Object containing event properties
   */
  addEvent: (eventName: string, properties?: AllowedTrackProperties) => void;
  /**
   * Function to add new flow properties
   * @param newProperties Object new properties
   */
  addFlowProperties: (properties: AllowedTrackProperties) => void;
};

// Flow Tracking Functions
// -----------------------------------
// Write a function to take multiple objects as arguments, and merge them into one object
const mergeProperties = (
  ...args: (TrackProperties | undefined)[]
): TrackProperties => {
  const hasProperties = args.some((arg) => !!arg);
  if (!hasProperties) {
    return {};
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

const cleanEventName = (eventName: string) => eventName.replace(/[^a-zA-Z0-9\s\-_]/g, '');
const getEventName = (flowName: string, eventName: string) => `${flowName}_${cleanEventName(eventName)}`;

const trackFlowFn = (
  moduleName: string,
  flowName: string,
  properties?: AllowedTrackProperties,
): Flow => {
  // Track the start of the flow
  const flowId = generateFlowId();
  const flowStartTime = Date.now();

  // Flow tracking
  let currentStepCount = 0;
  let previousStepTime = 0;

  let flowProperties: TrackProperties = {};
  const mergeFlowProps = (...args: (TrackProperties | undefined)[]) => mergeProperties(flowProperties, ...args, {
    flowId,
    flowName,
  });

  // Set up flow properties
  flowProperties = mergeFlowProps(properties);

  const addFlowProperties = (newProperties: AllowedTrackProperties) => {
    if (newProperties) {
      flowProperties = mergeFlowProps(newProperties);
    }
  };

  const addEvent = (
    eventName: string,
    eventProperties?: AllowedTrackProperties,
  ) => {
    const event = getEventName(flowName, eventName);

    // Calculate duration since previous step
    let duration = 0;
    const currentTime = performance.now();
    if (currentStepCount > 0) {
      duration = currentTime - previousStepTime;
    }
    const mergedProps = mergeFlowProps(eventProperties, {
      flowEventName: eventName,
      flowStep: currentStepCount,
    });
    trackDuration(moduleName, event, duration, mergedProps);

    // Increment counters
    currentStepCount++;
    previousStepTime = currentTime;
  };

  // Trigger a Start Event as a record of creating the flow
  addEvent('Start');

  return {
    details: {
      moduleName,
      flowName,
      flowId,
      flowStartTime,
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
 * const flow = trackFlow("passport", "performTransaction", { transationType: "transfer" });
 * // Do something...
 * flow.addEvent("clickItem");
 * // Do something...
 * flow.addFlowProperties({ item: "item1" });
 * flow.addEvent("guardianCheck", {"invisible": "true"});
 * // Do something...
 * flow.addEvent("guardianCheckComplete");
 * flow.end();
 * ```
 */
export const trackFlow = errorBoundary(trackFlowFn);
