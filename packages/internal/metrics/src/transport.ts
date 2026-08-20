import {
  disableTelemetry,
  getClientId,
  getRuntimeId,
  getSdkVersion,
  isTelemetryEnabled,
} from './client';
import type { MetricEvent } from './types';
import { toV1WireEnvelope } from './wire';

const IMTBL_API = 'https://api.immutable.com';

const encodeBase64 = (payload: string): string => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(payload, 'utf-8').toString('base64');
  }
  if (typeof btoa === 'function') {
    return btoa(unescape(encodeURIComponent(payload)));
  }
  throw new Error('Base64 encoding not supported in this environment');
};

const postMetrics = async (events: MetricEvent[]): Promise<number> => {
  const envelope = toV1WireEnvelope(events, {
    rid: getRuntimeId(),
    sdkVersion: getSdkVersion(),
    clientId: getClientId(),
  });

  const response = await fetch(`${IMTBL_API}/v1/sdk/metrics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload: encodeBase64(JSON.stringify(envelope)) }),
  });
  return response.status;
};

let pending: MetricEvent[] = [];
let flushScheduled = false;

const send = async (events: MetricEvent[]): Promise<void> => {
  if (!isTelemetryEnabled() || events.length === 0) {
    return;
  }

  try {
    const status = await postMetrics(events);
    if (status === 204 || status < 200 || status >= 300) {
      disableTelemetry();
    }
  } catch {
    disableTelemetry();
  }
};

/** Fire-and-forget send; coalesces events in the same JS tick. */
export const enqueue = (event: MetricEvent): void => {
  if (!isTelemetryEnabled()) {
    return;
  }

  pending.push(event);
  if (flushScheduled) {
    return;
  }

  flushScheduled = true;
  queueMicrotask(() => {
    flushScheduled = false;
    if (!isTelemetryEnabled()) {
      pending = [];
      return;
    }
    const batch = pending;
    pending = [];
    send(batch).catch(() => undefined);
  });
};

/** Reset for unit tests only. */
export const resetTransportForTests = (): void => {
  pending = [];
  flushScheduled = false;
};
