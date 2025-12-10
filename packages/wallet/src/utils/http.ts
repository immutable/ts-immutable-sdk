export type HttpErrorResponse = {
  status?: number;
  data?: unknown;
};

export type AxiosErrorLike = {
  isAxiosError?: boolean;
  response?: HttpErrorResponse;
  message?: string;
};

export const isAxiosError = (error: unknown): error is AxiosErrorLike => (
  typeof error === 'object'
  && error !== null
  && 'isAxiosError' in error
);
