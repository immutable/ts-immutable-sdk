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
