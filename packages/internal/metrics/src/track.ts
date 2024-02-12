import { initialise, isInitialised } from './initialise';
import {
  addEvent,
  flattenProperties,
  getAllDetails,
  getEvents,
  removeSentEvents,
} from './utils/state';
import { errorBoundary } from './utils/errorBoundary';
import { post } from './utils/request';
import { isTestEnvironment } from './utils/checkEnv';
import {
  getGlobalisedCachedFunction,
  getGlobalisedValue,
} from './utils/globalise';

export const POLLING_FREQUENCY = 5000;

// Store the event in the event store
const trackFn = (
  moduleName: string,
  eventName: string,
  properties?: Record<string, string | number | boolean>,
) => {
  const event = {
    event: `${moduleName}.${eventName}`,
    time: new Date().toISOString(),
    ...(properties && { properties: flattenProperties(properties) }),
  };
  addEvent(event);
};
export const track = errorBoundary(
  getGlobalisedCachedFunction('track', trackFn),
);

// Sending events to the server
const flushFn = async () => {
  // Don't flush if not initialised
  if (isInitialised() === false) {
    await initialise();
    return;
  }

  const events = getEvents();
  if (events.length === 0) {
    return;
  }
  // Track events length here, incase
  const numEvents = events.length;

  // Get details and send it with the track request
  const details = getAllDetails();

  const metricsPayload = {
    version: 1,
    data: {
      events,
      details,
    },
  };

  const response = await post('/v1/sdk/metrics', metricsPayload);
  if (response instanceof Error) {
    return;
  }

  // Clear events if successfully posted
  removeSentEvents(numEvents);
};
const flush = errorBoundary(flushFn);

// Flush events every 5 seconds
const flushPoll = async () => {
  await flush();
  setTimeout(flushPoll, POLLING_FREQUENCY);
};

let flushingStarted = false;
const startFlushing = () => {
  if (flushingStarted) {
    return;
  }
  flushingStarted = true;
  flushPoll();
};

// This will get initialised when module is imported.
if (!isTestEnvironment()) {
  errorBoundary(getGlobalisedValue('startFlushing', startFlushing))();
}
