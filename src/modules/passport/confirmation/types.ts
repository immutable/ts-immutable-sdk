import { UnsignedTransferRequest } from '@imtbl/core-sdk';

const ReceiveMessageType = ['confirmation_window_ready', 'transaction_confirmed', 'transaction_error'] as const;
type ReceiveTypeTuple = typeof ReceiveMessageType;
export type ReceiveMessage = ReceiveTypeTuple[number];

export function isReceiveMessageType(value: string): value is ReceiveMessage {
  return ReceiveMessageType.includes(value as ReceiveMessage);
}

export type PostMessageData = {
  transactionType: typeof TransactionType;
  transactionData: TransactionPayloadType;
}

export type DisplayConfirmationParams = {
  messageType: typeof PostMessageType;
  messageData: PostMessageData;
  accessToken: string;
}

export type PostMessageParams = DisplayConfirmationParams & {
  eventType: PassportEventType;
}

export type ConfirmationResult = {
  confirmed: boolean;
}

type TransactionPayloadType = UnsignedTransferRequest
export const TransactionType = "v1/transfers"

export const PostMessageType = "transaction_start"
type PassportEventType = "imx_passport_confirmation";
