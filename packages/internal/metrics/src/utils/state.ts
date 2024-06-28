import { getItem, setItem } from './localStorage';
import { Detail } from './constants';

export enum Store {
  EVENTS = 'metrics-events',
  RUNTIME = 'metrics-runtime',
}

// In memory storage for events and other data
let EVENT_STORE: any[];
let RUNTIME_DETAILS: Record<string, string>;

// Initialise store and runtime
const initialise = () => {
  EVENT_STORE = getItem(Store.EVENTS) || [];
  RUNTIME_DETAILS = getItem(Store.RUNTIME) || {};
};
initialise();

// Runtime Details
export const storeDetail = (key: Detail, value: string) => {
  RUNTIME_DETAILS = {
    ...RUNTIME_DETAILS,
    [key]: value,
  };
  setItem(Store.RUNTIME, RUNTIME_DETAILS);
};
export const getDetail = (key: Detail) => {
  // Handle the scenario where detail is a falsy value
  if (RUNTIME_DETAILS[key] === undefined) {
    return undefined;
  }
  return RUNTIME_DETAILS[key];
};

export const getAllDetails = () => RUNTIME_DETAILS;

// Events
export const getEvents = () => EVENT_STORE;

export const addEvent = (event: any) => {
  EVENT_STORE.push(event);
  setItem(Store.EVENTS, EVENT_STORE);
};

export const removeSentEvents = (numberOfEvents: number) => {
  EVENT_STORE = EVENT_STORE.slice(numberOfEvents);
  setItem(Store.EVENTS, EVENT_STORE);
};

type TrackProperties = Record<
string,
string | number | boolean | undefined
>;

export const flattenProperties = (properties: TrackProperties) => {
  const propertyMap: [string, string][] = [];
  Object.entries(properties).forEach(([key, value]) => {
    if (
      typeof key === 'string'
      || typeof value === 'string'
      || typeof value === 'number'
      || typeof value === 'boolean'
    ) {
      propertyMap.push([key, value!.toString()]);
    }
  });
  return propertyMap;
};
