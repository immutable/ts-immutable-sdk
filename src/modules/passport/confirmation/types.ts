import { GetSignableTradeRequest, GetSignableTransferRequest } from '@imtbl/core-sdk';

const ReceiveMessageType = ['confirmation_window_ready', 'transaction_confirmed', 'transaction_error'] as const;
type ReceiveTypeTuple = typeof ReceiveMessageType;
export type ReceiveMessage = ReceiveTypeTuple[number];

export function isReceiveMessageType(value: string): value is ReceiveMessage {
  return ReceiveMessageType.includes(value as ReceiveMessage);
}

type PostMessageData = {
  transactionType: TransactionType;
  transactionData: TransactionPayloadType;
}

export type DisplayConfirmationParams = {
  messageType: PostMessageType;
  messageData: PostMessageData;
  accessToken: string;
  passportDomain: string;
}

export type PostMessageParams = DisplayConfirmationParams & {
  eventType: PassportEventType;
}

export type ConfirmationResult = {
  confirmed: boolean;
}

type TransactionPayloadType = GetSignableTransferRequest | GetSignableTradeRequest
type TransactionType = "v1/transfer" | "order"

type PostMessageType = "transaction_start"
type PassportEventType = "imx-passport-confirmation";
