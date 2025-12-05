import { trackError } from '@imtbl/metrics';

export function errorBoundary<T extends (
  ...args: any[]) => any>(
  fn: T,
  fallbackResult?: ReturnType<T>,
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args) => {
    try {
      // Execute the original function
      const result = fn(...args);

      if (result instanceof Promise) {
        // Silent fail for now, in future
        // we can send errors to a logging service
        return result.catch((error) => {
          if (error instanceof Error) {
            trackError('passport', 'sessionActivityError', error);
          }
          return fallbackResult;
        });
      }

      return result;
    } catch (error: unknown | Error) {
      if (error instanceof Error) {
        trackError('passport', 'sessionActivityError', error);
      }
      // As above, fail silently for now
      return fallbackResult;
    }
  };
}
