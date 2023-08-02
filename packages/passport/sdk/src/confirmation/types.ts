import {
  GetSignableCancelOrderRequest,
  GetSignableOrderRequest,
  GetSignableTradeRequest,
  GetSignableTransferRequest,
  GetSignableTransferRequestV1,
} from '@imtbl/core-sdk';

export enum ReceiveMessage {
  CONFIRMATION_WINDOW_READY = 'confirmation_window_ready',
  TRANSACTION_CONFIRMED = 'transaction_confirmed',
  TRANSACTION_ERROR = 'transaction_error',
}

export enum SendMessage {
  TRANSACTION_START = 'transaction_start',
}

export enum TransactionTypes {
  cancelOrder = 'delete:v1/orders',
  createOrder = 'post:v1/orders',
  createTrade = 'post:v1/trades',
  createTransfer = 'post:v1/transfers',
  createBatchTransfer = 'post:v2/transfers',
}

export type CancelOrder = {
  transactionType: TransactionTypes.cancelOrder;
  transactionData: GetSignableCancelOrderRequest;
};

export type CreateOrder = {
  transactionType: TransactionTypes.createOrder;
  transactionData: GetSignableOrderRequest;
};

export type CreateTrade = {
  transactionType: TransactionTypes.createTrade;
  transactionData: GetSignableTradeRequest;
};

export type CreateTransfer = {
  transactionType: TransactionTypes.createTransfer;
  transactionData: GetSignableTransferRequestV1;
};

export type CreateBatchTransfer = {
  transactionType: TransactionTypes.createBatchTransfer;
  transactionData: GetSignableTransferRequest;
};

export type Transaction =
  | CancelOrder
  | CreateTrade
  | CreateOrder
  | CreateTransfer
  | CreateBatchTransfer;

export type DisplayConfirmationParams = {
  messageType: SendMessage;
  messageData: Transaction;
};

export type ConfirmationResult = {
  confirmed: boolean;
};

export const PASSPORT_EVENT_TYPE = 'imx_passport_confirmation';
