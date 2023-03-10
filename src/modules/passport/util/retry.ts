const POLL_INTERVAL = 1 * 1000;   // every 1 second
const MAX_RETRIES = 3;


export type RetryOption = {
    retries?: number;
    interval?: number;
    finalErr?: Error;
}
const wait = (ms: number) => new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms)
})

export const retryWithDelay = async <T>(
    fn: () => Promise<T>, options?: RetryOption
): Promise<T> => {
    const {
        retries = MAX_RETRIES,
        interval = POLL_INTERVAL,
        finalErr = Error('Retry failed')
    } = options || {}
    try {
       return await fn()
    } catch (err) {
        if (retries <= 0) {
            return Promise.reject(finalErr);
        }
        await wait(interval)
        return retryWithDelay(fn, { retries: (retries - 1), finalErr });
    }
}
