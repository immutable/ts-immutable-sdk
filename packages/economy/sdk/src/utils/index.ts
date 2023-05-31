/**
 * Async dummy function
 * @param key identifier
 * @param result return value
 * @returns async function that will log arguments and return value
 */
export const asyncFn = <T>(key: string, result: T | null = null) => async (...args: unknown[]) => {
  // eslint-disable-next-line no-console
  console.log(key, ...args);
  return result as T;
};

export const comparison = (a: unknown, b: unknown, operator: string) => {
  if (operator === 'eq') {
    return a === b;
  }

  if (operator === 'gt') {
    return Number(a) > Number(b);
  }

  if (operator === 'gte') {
    return Number(a) >= Number(b);
  }

  if (operator === 'lt') {
    return Number(a) < Number(b);
  }

  if (operator === 'lte') {
    return Number(a) <= Number(b);
  }

  return false;
};
