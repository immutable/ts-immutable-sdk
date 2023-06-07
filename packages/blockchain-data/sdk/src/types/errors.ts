import { mr } from '@imtbl/generated-clients';

interface OpenAPIError extends mr.BasicAPIError {
  code: string;

  details: {
    [key: string]: any;
  } | null;
}

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
