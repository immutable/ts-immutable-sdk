type HttpErrorResponse = {
  status?: number;
  data?: unknown;
};

type HttpErrorLike = {
  response?: HttpErrorResponse;
};

export const getHttpErrorResponse = (error: unknown): HttpErrorResponse | undefined => {
  if (
    typeof error === 'object'
    && error !== null
    && 'response' in error
  ) {
    const { response } = error as HttpErrorLike;
    if (response && typeof response === 'object') {
      return response;
    }
  }
  return undefined;
};

export const getHttpStatus = (error: unknown): number | undefined => (
  getHttpErrorResponse(error)?.status
);

export const getHttpResponseData = <T>(error: unknown): T | undefined => (
  getHttpErrorResponse(error)?.data as T | undefined
);
