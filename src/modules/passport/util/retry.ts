const POLL_INTERVAL = 1 * 1000;   // every 1 second
const MAX_RETRIES = 5;


const wait = (ms: number) => new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms)
})

export const retryWithDelay = async <T>(
    fn: () => Promise<T>, retries = MAX_RETRIES, interval = POLL_INTERVAL,
    finalErr = Error('Retry failed')
): Promise<void> => {
    try {
        await fn()
    } catch (err) {
        if (retries <= 0) {
            return Promise.reject(finalErr);
        }
        console.info(`retrying remaining ${retries} times`)
        await wait(interval)
        return retryWithDelay(fn, (retries - 1), interval, finalErr);
    }
}
