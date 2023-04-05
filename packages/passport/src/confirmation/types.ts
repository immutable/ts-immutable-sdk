import { GetSignableCancelOrderRequest, GetSignableOrderRequest, UnsignedTransferRequest } from '@imtbl/core-sdk';

export enum ReceiveMessage {
  CONFIRMATION_WINDOW_READY = 'confirmation_window_ready',
  TRANSACTION_CONFIRMED = 'transaction_confirmed',
  TRANSACTION_ERROR = 'transaction_error',
}

export enum SendMessage {
  TRANSACTION_START = 'transaction_start'
}

export enum TransactionTypes {
  CancelOrder = 'v1/cancel',
  Order = 'v1/orders',
  TRANSFER = 'v1/transfers'
}

export type CancelOrder = {
  transactionType: TransactionTypes.CancelOrder,
  transactionData: GetSignableCancelOrderRequest,
}

export type Order = {
  transactionType: TransactionTypes.Order,
  transactionData: GetSignableOrderRequest,
}

export type Transfer = {
  transactionType: TransactionTypes.TRANSFER;
  transactionData: UnsignedTransferRequest;
}

export type Transaction = CancelOrder | Order | Transfer;

export type DisplayConfirmationParams = {
  messageType: SendMessage;
  messageData: Transaction;
}

export type ConfirmationResult = {
  confirmed: boolean;
}

export const PassportEventType = 'imx_passport_confirmation';
