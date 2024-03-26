import { imx } from '@imtbl/generated-clients';

/**
 * Custom Error class that is returned from the API when a request fails
 */
export class IMXError extends Error {
  readonly code: string;

  readonly details?: string;

  constructor({ code, details, message }: imx.APIError) {
    super(message);
    this.code = code;
    this.details = details;
  }
}
