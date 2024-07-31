import { trackError } from '@imtbl/metrics';

const moduleName = 'passport';

export const handleError = (method: string, error: unknown) => {
  const wrappedError = new Error(`${moduleName} ${method} error`, { cause: error });

  trackError('passport', method, wrappedError);
  return error;
}
