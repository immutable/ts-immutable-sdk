export enum PostMessageHandlerEventType {
  SYN = 'IMTBL_POST_MESSAGE_SYN',
  ACK = 'IMTBL_POST_MESSAGE_ACK',
  PROVIDER_RELAY = 'IMTBL_PROVIDER_RELAY',
  PROVIDER_UPDATED = 'IMTBL_PROVIDER_UPDATED',
  EIP_6963_EVENT = 'IMTBL_EIP_6963_EVENT',
  WIDGET_EVENT = 'IMTBL_CHECKOUT_WIDGET_EVENT',
}

export type PostMessageProviderRelayData = any;

export type PostMessageEIP6963Data = any;

export type PostMessagePayload =
  | PostMessageProviderRelayData
  | PostMessageEIP6963Data;
