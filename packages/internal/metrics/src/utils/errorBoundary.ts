export function errorBoundary<T extends (...args: any[]) => any>(fn: T): T {
  const wrappedFunction = ((...args: Parameters<T>): ReturnType<T> => {
    try {
      // Execute the original function
      const result = fn(...args);

      if (result instanceof Promise) {
        // Silent fail for now, in future
        // we can send errors to a logging service
        return result.catch(() => undefined) as ReturnType<T>;
      }

      return result;
    } catch (error) {
      // As above, fail silently for now
      return undefined as ReturnType<T>;
    }
  }) as T;

  return wrappedFunction;
}
