import { BasicAPIError } from '@imtbl/multi-rollup-api-client';

/**
 * Custom Error class that is returned from the API when a request fails
 */
export class APIError extends Error {
  readonly link: string;

  readonly traceId: string;

  constructor({ message, link, trace_id: traceId }: BasicAPIError) {
    super(message);
    this.link = link;
    this.traceId = traceId;
  }
}
