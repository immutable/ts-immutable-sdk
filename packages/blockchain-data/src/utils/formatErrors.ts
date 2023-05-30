import { BasicAPIError } from '@imtbl/multi-rollup-api-client';
import axios from 'axios';
import { APIError } from '../types/errors';

/**
 * [Formats an error in the APIError shape](https://axios-http.com/docs/handling_errors)
 * @param error - The Error object thrown by the request
 * @returns APIError
 */
export function formatError(error: unknown): APIError {
  if (axios.isAxiosError(error) && error.response) {
    const apiError: BasicAPIError = error.response.data;
    if (apiError.code && apiError.message) {
      return new APIError({
        code: apiError.code,
        details: apiError.details,
        message: apiError.message,
      });
    }

    return new APIError({
      code:
        error.code ?? error.response?.status.toString() ?? 'unknown_error_code',
      message: String(error),
    });
  }

  return new APIError({
    code: 'unknown_error_code',
    message: String(error),
  });
}
