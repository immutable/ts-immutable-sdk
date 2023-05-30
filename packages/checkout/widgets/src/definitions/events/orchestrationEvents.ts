export enum OrchestrationEventType {
  REQUEST_CONNECT = 'request-connect',
  REQUEST_WALLET = 'request-wallet',
  REQUEST_SWAP = 'request-swap',
  REQUEST_BRIDGE = 'request-bridge',
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
  fromTokenAddress: string;
  amount: string;
};
