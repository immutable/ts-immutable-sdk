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
  CancelOrder = 'v1/cancel',
  Order = 'v1/orders',
  CreateTrade = 'v1/trades',
  Transfer = 'v1/transfers',
  MultiTransfer = 'v1/multi-transfers',
}

export type CancelOrder = {
  transactionType: TransactionTypes.CancelOrder,
  transactionData: GetSignableCancelOrderRequest,
}

export type Order = {
  transactionType: TransactionTypes.Order,
  transactionData: GetSignableOrderRequest,
}

export type CreateTrade = {
  transactionType: TransactionTypes.CreateTrade;
  transactionData: GetSignableTradeRequest,
}

export type Transfer = {
  transactionType: TransactionTypes.Transfer;
  transactionData: GetSignableTransferRequestV1;
}

export type MultiTransfer = {
  transactionType: TransactionTypes.MultiTransfer;
  transactionData: GetSignableTransferRequest,
}

export type Transaction = CancelOrder | CreateTrade | Order | Transfer | MultiTransfer;

export type DisplayConfirmationParams = {
  messageType: SendMessage;
  messageData: Transaction;
}

export type ConfirmationResult = {
  confirmed: boolean;
}

export const PassportEventType = 'imx_passport_confirmation';
