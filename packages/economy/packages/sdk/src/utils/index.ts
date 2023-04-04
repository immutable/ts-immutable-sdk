/**
 * Async dummy function
 * @param key identifier
 * @param result return value
 * @returns async function that will log arguments and return value
 */
export const asyncFn =
  <T>(key: string, result: T | null = null) =>
  async (...args: unknown[]) => {
    console.log(key, ...args);
    return result as T;
  };
