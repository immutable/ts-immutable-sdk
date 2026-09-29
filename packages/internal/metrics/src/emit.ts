import { isTelemetryEnabled } from './client';
import { errorBoundary } from './errorBoundary';
import { enqueue } from './transport';
import type { TrackOptions } from './types';

const extractErrorCode = (error: Error): string | undefined => {
  const maybe = error as Error & { type?: unknown; code?: unknown };
  if (typeof maybe.type === 'string' && maybe.type.length > 0) {
    return maybe.type;
  }
  if (typeof maybe.code === 'string' && maybe.code.length > 0) {
    return maybe.code;
  }
  if (typeof maybe.code === 'number' && Number.isFinite(maybe.code)) {
    return String(maybe.code);
  }
  return undefined;
};

const toErrorPayload = (error: Error): { name?: string; code?: string } => {
  const code = extractErrorCode(error);
  return {
    name: error.name,
    ...(code ? { code } : {}),
  };
};

const trackFn = (
  moduleName: string,
  eventName: string,
  options?: TrackOptions,
): void => {
  if (!isTelemetryEnabled()) {
    return;
  }

  const durationMs = typeof options?.durationMs === 'number' && Number.isFinite(options.durationMs)
    ? Math.round(options.durationMs)
    : undefined;

  enqueue({
    module: moduleName,
    name: eventName,
    time: Date.now(),
    ...(durationMs !== undefined ? { durationMs } : {}),
    ...(options?.error ? { error: toErrorPayload(options.error) } : {}),
  });
};

/**
 * Track a function / operation invocation.
 * Pass `error` when the invocation failed (name + code only; no message/stack).
 *
 * ```ts
 * track('passport', 'login');
 * track('passport', 'login', { durationMs: 120 });
 * track('passport', 'login', { error });
 * ```
 */
export const track = errorBoundary(trackFn);
