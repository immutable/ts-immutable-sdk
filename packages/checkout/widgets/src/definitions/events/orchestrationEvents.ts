export enum OrchestrationEventType {
  REQUEST_CONNECT = 'request-connect',
  REQUEST_WALLET = 'request-wallet',
  REQUEST_SWAP = 'request-swap',
  REQUEST_BRIDGE = 'request-bridge',
  REQUEST_ONRAMP = 'request-onramp',
}

export type RequestConnectEvent = {
  providerPreference: string;
};

export type RequestWalletEvent = {
  providerPreference: string;
};

export type RequestSwapEvent = {
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
};

export type RequestBridgeEvent = {
  tokenAddress: string;
  amount: string;
};

export type RequestOnrampEvent = {
  tokenAddress: string;
  amount: string;
};
