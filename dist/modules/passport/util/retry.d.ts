export declare const MAX_RETRIES = 3;
export type RetryOption = {
    retries?: number;
    interval?: number;
    finalErr?: Error;
};
export declare const retryWithDelay: <T>(fn: () => Promise<T>, options?: RetryOption) => Promise<T>;
