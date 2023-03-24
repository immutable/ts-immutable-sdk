export declare enum PassportErrorType {
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
    INVALID_CONFIGURATION = "INVALID_CONFIGURATION",
    WALLET_CONNECTION_ERROR = "WALLET_CONNECTION_ERROR",
    NOT_LOGGED_IN_ERROR = "NOT_LOGGED_IN_ERROR",
    REFRESH_TOKEN_ERROR = "REFRESH_TOKEN_ERROR",
    USER_REGISTRATION_ERROR = "USER_REGISTRATION_ERROR",
    TRANSFER_ERROR = "TRANSFER_ERROR",
    CREATE_ORDER_ERROR = "CREATE_ORDER_ERROR",
    CANCEL_ORDER_ERROR = "CANCEL_ORDER_ERROR",
    EXCHANGE_TRANSFER_ERROR = "EXCHANGE_TRANSFER_ERROR",
    CREATE_TRADE_ERROR = "CREATE_TRADE_ERROR"
}
export declare class PassportError extends Error {
    type: PassportErrorType;
    constructor(message: string, type: PassportErrorType);
}
export declare const withPassportError: <T>(fn: () => Promise<T>, customErrorType: PassportErrorType) => Promise<T>;
