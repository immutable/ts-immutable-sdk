/**
 * Structured error returned by the transport layer when a send fails.
 *
 * - `status` is the HTTP status code on a protocol-level error, or `0`
 *   when the fetch itself rejected (network failure, CORS, DNS).
 * - `endpoint` is the full URL that was called.
 * - `body` is the parsed response body when content-type was JSON,
 *   the raw string when not, or undefined when the response had no
 *   parseable body (e.g. a network failure).
 * - `cause` is the original error object (`TypeError`, DOMException,
 *   etc.) on a network failure; undefined on an HTTP error.
 */
export interface TransportError {
  status: number;
  endpoint: string;
  body?: unknown;
  cause?: unknown;
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
