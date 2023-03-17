export declare enum ProviderErrorType {
    PROVIDER_CONNECTION_ERROR = "PROVIDER_CONNECTION_ERROR",
    WALLET_CONNECTION_ERROR = "WALLET_CONNECTION_ERROR"
}
type ErrorType = {
    type: ProviderErrorType;
    message?: string;
};
export declare class ProviderError extends Error {
    type: ProviderErrorType;
    constructor(message: string, type: ProviderErrorType);
}
export declare const withProviderError: <T>(fn: () => Promise<T>, customError: ErrorType) => Promise<T>;
export {};
