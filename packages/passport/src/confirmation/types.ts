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
  TRANSACTION_START = 'transaction_start'
}

export enum TransactionTypes {
  CancelOrder = 'delete:v1/orders',
  CreateOrder = 'post:v1/orders',
  CreateTrade = 'post:v1/trades',
  CreateTransfer = 'post:v1/transfers',
  CreateBatchTransfer = 'post:v2/transfers',
}

export type CancelOrder = {
  transactionType: TransactionTypes.CancelOrder,
  transactionData: GetSignableCancelOrderRequest,
}

export type CreateOrder = {
  transactionType: TransactionTypes.CreateOrder,
  transactionData: GetSignableOrderRequest,
}

export type CreateTrade = {
  transactionType: TransactionTypes.CreateTrade;
  transactionData: GetSignableTradeRequest,
}

export type CreateTransfer = {
  transactionType: TransactionTypes.CreateTransfer;
  transactionData: GetSignableTransferRequestV1;
}

export type CreateBatchTransfer = {
  transactionType: TransactionTypes.CreateBatchTransfer;
  transactionData: GetSignableTransferRequest,
}

export type Transaction =
  | CancelOrder
  | CreateTrade
  | CreateOrder
  | CreateTransfer
  | CreateBatchTransfer;

export type DisplayConfirmationParams = {
  messageType: SendMessage;
  messageData: Transaction;
}

export type ConfirmationResult = {
  confirmed: boolean;
}

export const PassportEventType = 'imx_passport_confirmation';
