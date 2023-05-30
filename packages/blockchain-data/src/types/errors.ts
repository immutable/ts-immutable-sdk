import {
  APIError400,
  APIError404,
  APIError500,
} from '@imtbl/multi-rollup-api-client';

type OpenAPIError = APIError400 | APIError404 | APIError500;

/**
 * Custom Error class that is returned from the API when a request fails
 */
export class APIError extends Error {
  readonly code: string;

  readonly details: {
    [key: string]: any;
  } | null;

  readonly link: string;

  readonly traceId: string;

  constructor({
    message,
    code,
    details,
    link,
    trace_id: traceId,
  }: OpenAPIError) {
    super(message);
    this.code = code;
    this.details = details;
    this.link = link;
    this.traceId = traceId;
  }
}
