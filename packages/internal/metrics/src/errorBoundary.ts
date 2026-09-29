export function errorBoundary<T extends (
  ...args: any[]) => any>(
  fn: T,
  fallbackResult?: ReturnType<T>,
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args) => {
    try {
      const result = fn(...args);

      if (result instanceof Promise) {
        return result.catch(() => fallbackResult);
      }

      return result;
    } catch {
      return fallbackResult;
    }
  };
}
