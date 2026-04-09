/**
 * Structured error returned by the transport layer when a send fails.
 *
 * Extends native {@link Error} so stack traces are captured at the
 * construction site and instances flow through standard error-reporting
 * tools (browser devtools, Sentry, `@imtbl/metrics`) without custom
 * handling.
 *
 * - `status` is the HTTP status code on a protocol-level error, or `0`
 *   when the fetch itself rejected (network failure, CORS, DNS).
 * - `endpoint` is the full URL that was called.
 * - `body` is the parsed response body when content-type was JSON,
 *   the raw string when not, or undefined when the response had no
 *   parseable body (e.g. a network failure).
 * - `cause` (inherited from {@link Error}, ES2022) is the original error
 *   object (`TypeError`, `DOMException`, etc.) on a network failure;
 *   undefined on an HTTP error.
 */
export class TransportError extends Error {
  readonly status: number;

  readonly endpoint: string;

  readonly body?: unknown;

  constructor(init: {
    status: number;
    endpoint: string;
    body?: unknown;
    cause?: unknown;
  }) {
    super(
      `audience transport failed: ${init.status || 'network error'} ${init.endpoint}`,
      init.cause !== undefined ? { cause: init.cause } : undefined,
    );
    this.name = 'TransportError';
    this.status = init.status;
    this.endpoint = init.endpoint;
    this.body = init.body;
  }
}

/**
 * Return type of every transport send.
 *
 * `ok: true` means the backend accepted the payload (HTTP 2xx). On
 * `ok: false`, `error` is always populated with a structured reason.
 *
 * Implementations of `HttpSend` MUST NOT reject — failures travel
 * through this result type. Callers (notably `MessageQueue.flushUnload`)
 * rely on this contract for fire-and-forget paths.
 */
export interface TransportResult {
  ok: boolean;
  error?: TransportError;
}

/**
 * Stable, machine-readable code identifying the kind of audience SDK
 * failure. Studios can branch on this in their `onError` handler.
 *
 * - `'FLUSH_FAILED'` — POST to `/v1/audience/messages` returned non-2xx.
 * - `'CONSENT_SYNC_FAILED'` — PUT to `/v1/audience/tracking-consent` returned non-2xx.
 * - `'NETWORK_ERROR'` — fetch rejected before a response was received
 *                       (network failure, CORS, DNS, etc.).
 * - `'VALIDATION_REJECTED'` — backend returned 2xx but the body reported
 *                       `rejected > 0`. Terminal: retrying won't help, the
 *                       messages were dropped from the queue. Inspect
 *                       `responseBody` for the per-message detail when the
 *                       backend provides it.
 */
export type AudienceErrorCode =
  | 'FLUSH_FAILED'
  | 'CONSENT_SYNC_FAILED'
  | 'NETWORK_ERROR'
  | 'VALIDATION_REJECTED';

/**
 * Public error type passed to the SDK's `onError` callback. Wraps the
 * low-level {@link TransportError} and adds a closed `code` union plus a
 * human-readable `message`.
 *
 * Lives in `@imtbl/audience-core` so every surface (web, pixel, unity,
 * unreal) reports failures through the same shape — no per-package
 * error class, no duplicated mapping logic.
 *
 * Is an instance of `Error` so it can be thrown, logged, or passed to
 * Sentry / Datadog without an adapter.
 */
export class AudienceError extends Error {
  readonly code: AudienceErrorCode;

  readonly status: number;

  readonly endpoint: string;

  readonly responseBody?: unknown;

  // `cause` is a standard Error prop in ES2022, declared here for older
  // TS targets that don't have it in their lib.d.ts.
  readonly cause?: unknown;

  constructor(init: {
    code: AudienceErrorCode;
    message: string;
    status: number;
    endpoint: string;
    responseBody?: unknown;
    cause?: unknown;
  }) {
    super(init.message);
    this.name = 'AudienceError';
    this.code = init.code;
    this.status = init.status;
    this.endpoint = init.endpoint;
    this.responseBody = init.responseBody;
    this.cause = init.cause;
  }
}

/**
 * Convert a low-level {@link TransportError} into a public
 * {@link AudienceError} for delivery to studio code.
 *
 * Centralised so MessageQueue and ConsentManager don't each carry their
 * own copy of `status === 0 → NETWORK_ERROR` mapping logic.
 *
 * @param err     The transport-level failure.
 * @param source  Which subsystem hit the error — selects the error code
 *                and shapes the human message.
 * @param count   For `'flush'` failures, the number of messages in the
 *                batch. Used in the human-readable message; ignored for
 *                consent failures.
 */
export function toAudienceError(
  err: TransportError,
  source: 'flush' | 'consent',
  count?: number,
): AudienceError {
  // Network failure — no HTTP response received.
  if (err.status === 0) {
    return new AudienceError({
      code: 'NETWORK_ERROR',
      message: source === 'flush'
        ? `Network error sending ${count ?? 0} messages`
        : 'Network error syncing consent',
      status: 0,
      endpoint: err.endpoint,
      cause: err.cause,
    });
  }

  // 2xx response with backend-rejected messages. Terminal, do not retry —
  // the only way ok:false comes back with a 2xx status is when httpSend
  // detected `rejected > 0` in the parsed response body.
  if (err.status >= 200 && err.status < 300) {
    const body = err.body as { accepted?: number; rejected?: number } | undefined;
    const rejected = body?.rejected ?? 0;
    const accepted = body?.accepted ?? 0;
    return new AudienceError({
      code: 'VALIDATION_REJECTED',
      message: `Backend rejected ${rejected} of ${rejected + accepted} messages`,
      status: err.status,
      endpoint: err.endpoint,
      responseBody: err.body,
    });
  }

  // Generic HTTP failure (4xx / 5xx).
  return new AudienceError({
    code: source === 'flush' ? 'FLUSH_FAILED' : 'CONSENT_SYNC_FAILED',
    message: source === 'flush'
      ? `Flush failed with status ${err.status}`
      : `Consent sync failed with status ${err.status}`,
    status: err.status,
    endpoint: err.endpoint,
    responseBody: err.body,
    cause: err.cause,
  });
}
