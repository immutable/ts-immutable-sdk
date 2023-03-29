import { UnsignedTransferRequest } from '@imtbl/core-sdk';
export declare enum ReceiveMessage {
    CONFIRMATION_WINDOW_READY = "confirmation_window_ready",
    TRANSACTION_CONFIRMED = "transaction_confirmed",
    TRANSACTION_ERROR = "transaction_error"
}
export declare enum SendMessage {
    TRANSACTION_START = "transaction_start"
}
export declare enum TransactionTypes {
    TRANSFER = "v1/transfers"
}
export type Transfer = {
    transactionType: TransactionTypes.TRANSFER;
    transactionData: UnsignedTransferRequest;
};
export type Transaction = Transfer;
export type DisplayConfirmationParams = {
    messageType: SendMessage;
    messageData: Transaction;
};
export type ConfirmationResult = {
    confirmed: boolean;
};
export declare const PassportEventType = "imx_passport_confirmation";
