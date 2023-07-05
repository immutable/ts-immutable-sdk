/* eslint @typescript-eslint/no-unused-vars: ["error", { "argsIgnorePattern": "^_" }] */

const pause = async (timeMs: number): Promise<void> => new Promise((resolve, _) => {
  setTimeout(resolve, timeMs);
});

/* polls a request() function until terminationPredicate() returns true. Returns
 * the result of the request() function. If more than maxIterations are executed
 * before terminationPredicate() returns true, poll returns undefined.
 */
export const poll = async<T> (
  maxIterations: number,
  waitTimeMs: number,
  terminationPredicate: (_: T) => boolean,
  request: () => Promise<T>,
): Promise<T | undefined> => {
  // NOTE: We actually want the await to avoid sending all requests in parallel.
  // See: https://eslint.org/docs/latest/rules/no-await-in-loop
  /* eslint-disable no-await-in-loop */
  for (let it = 0; it < maxIterations; it++) {
    const result = await request();
    if (terminationPredicate(result)) {
      return result;
    }

    await pause(waitTimeMs);
  }
  /* eslint-enable no-await-in-loop */

  return undefined;
};
