// eslint-disable-next-line no-promise-executor-return
const sleep = (ms = 0) => ms && new Promise((resolve) => setTimeout(resolve, ms));

export interface RetryType {
  retryIntervalMs: number
  // if not specified the retry function will retry until a success state is returned
  retries?: number;
  // Condition in which the retry logic must exit although there are still retires
  nonRetryable?: (err: any) => boolean
  // Condition in which the retry logic must exit without throwing an error although there are still retires
  nonRetryableSilently?: (err: any) => boolean
}

export const retry = async <T>(
  fn: () => Promise<T> | T,
  {
    retries,
    retryIntervalMs,
    nonRetryable,
    nonRetryableSilently,
  }: RetryType,
): Promise<T | undefined> => {
  let currentRetries = retries;

  try {
    return await fn();
  } catch (error: any) {
    if (nonRetryableSilently && nonRetryableSilently(error)) return undefined;

    if (nonRetryable && nonRetryable(error)) throw error;

    if (currentRetries !== undefined) {
      if (currentRetries <= 0) {
        throw error;
      }
      currentRetries -= 1;
    }

    await sleep(retryIntervalMs);
    return retry(fn, {
      retries: currentRetries,
      retryIntervalMs,
      nonRetryable,
      nonRetryableSilently,
    });
  }
};
