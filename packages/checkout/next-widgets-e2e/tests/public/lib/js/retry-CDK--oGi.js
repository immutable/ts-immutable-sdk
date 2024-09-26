import { r as reactExports, bs as getDefaultTokenImage, j as jsx, cM as useBrowserLayoutEffect } from './index-Ae2juTF3.js';

function TokenImage({ src, name, environment, theme, defaultImage, ...forwardedProps }) {
    const [error, setError] = reactExports.useState(false);
    const url = reactExports.useMemo(() => (!src || error
        ? defaultImage
            || (theme && getDefaultTokenImage(environment, theme))
            || ''
        : src), [src, error]);
    const { ...cleanedProps } = forwardedProps;
    if (Object.prototype.hasOwnProperty.call(cleanedProps, 'responsiveSizes')) {
        delete cleanedProps.responsiveSizes;
    }
    return (jsx("img", { src: url, alt: name, onError: () => setError(true), ...cleanedProps }));
}

// Inspired by https://usehooks-ts.com/react-hook/use-interval
function useInterval(callback, delay) {
    const savedCallback = reactExports.useRef(callback);
    const interval = reactExports.useRef(0);
    // Remember the latest callback if it changes.
    useBrowserLayoutEffect(() => {
        savedCallback.current = callback;
    }, [callback]);
    // Set up the interval.
    reactExports.useEffect(() => {
        // Don't schedule if no delay is specified.
        // Note: 0 is a valid value for delay.
        if (!delay && delay !== 0) {
            return;
        }
        interval.current = setInterval(() => savedCallback.current(), delay);
        // eslint-disable-next-line consistent-return
        return () => { clearInterval(interval.current); };
    }, [delay]);
    return () => {
        if (interval.current) {
            clearInterval(interval.current);
        }
    };
}

// eslint-disable-next-line no-promise-executor-return
const sleep = (ms = 0) => ms && new Promise((resolve) => setTimeout(resolve, ms));
const retry = async (fn, { retries, retryIntervalMs, nonRetryable, nonRetryableSilently, }) => {
    let currentRetries = retries;
    try {
        return await fn();
    }
    catch (error) {
        if (nonRetryableSilently && nonRetryableSilently(error))
            return undefined;
        if (nonRetryable && nonRetryable(error))
            throw error;
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

export { TokenImage as T, retry as r, useInterval as u };
