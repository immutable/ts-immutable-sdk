/* eslint-disable @typescript-eslint/naming-convention */
import axios from 'axios';
import { APIError } from '../types/errors';

/**
 * [Formats an error in the APIError shape](https://axios-http.com/docs/handling_errors)
 * @param error - The Error object thrown by the request
 * @returns APIError
 */
export function formatError(error: unknown): APIError {
  if (axios.isAxiosError(error) && error.response) {
    const apiError = error.response.data;
    if (apiError.code && apiError.message) {
      return new APIError({
        code: apiError.code,
        message: apiError.message,
        details: apiError.details || null,
        link: apiError.link || '',
        trace_id: apiError.trace_id || '',
      });
    }

    return new APIError({
      code:
        error.code ?? error.response?.status.toString() ?? 'unknown_error_code',
      message: String(error),
      details: null,
      link: '',
      trace_id: '',
    });
  }

  return new APIError({
    code: 'unknown_error_code',
    message: String(error),
    details: null,
    link: '',
    trace_id: '',
  });
}
