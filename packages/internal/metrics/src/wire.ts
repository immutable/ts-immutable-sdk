import type { MetricEvent } from './types';

/** Legacy sdk-analytics `/v1/sdk/metrics` envelope (version ≤ 1). */
export type V1WireEnvelope = {
  version: 1;
  data: {
    details: {
      rid: string;
      sdkVersion: string;
      passportClientId?: string;
    };
    events: V1WireEvent[];
  };
};

type V1WireEvent = {
  event: string;
  time: string;
  properties?: [string, string][];
};

const toV1WireEvent = (event: MetricEvent): V1WireEvent => {
  const {
    module,
    name: eventName,
    time,
    durationMs,
    error,
  } = event;
  const properties: [string, string][] = [];
  let name = eventName;

  if (typeof durationMs === 'number') {
    properties.push(['durationMs', String(durationMs)]);
  }

  if (error) {
    name = `trackError_${eventName}`;
    properties.push(['isTrackError', 'true']);
    if (error.name) {
      properties.push(['errorName', error.name]);
    }
    if (error.code) {
      properties.push(['errorCode', error.code]);
    }
  }

  return {
    event: `${module}.${name}`,
    time: new Date(time).toISOString(),
    ...(properties.length > 0 ? { properties } : {}),
  };
};

/**
 * Map slim internal events to the legacy v1 wire shape the backend expects.
 * Errors become `module.trackError_name` + `isTrackError` so NR path stays intact.
 */
export const toV1WireEnvelope = (
  events: MetricEvent[],
  details: { rid: string; sdkVersion: string; clientId?: string },
): V1WireEnvelope => ({
  version: 1,
  data: {
    details: {
      rid: details.rid,
      sdkVersion: details.sdkVersion,
      ...(details.clientId ? { passportClientId: details.clientId } : {}),
    },
    events: events.map(toV1WireEvent),
  },
});
