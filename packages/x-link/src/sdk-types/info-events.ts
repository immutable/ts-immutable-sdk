/**
 * WT-1001
 * These info events are dispatched by the SDK for Marketplaces and other applications which use Link, to listen to.
 * This has been designed in conjunction with the postMessage messageType.info that Link can fire to pass
 * data back to it's parent window (without closing Link itself).
 */
export const LINK_INFO_MESSAGE_TYPE = 'imx-link-info';

export enum ImxLinkInfoEventType {
  WALLET_CONNECTION = 'wallet-connection',
}

export type InfoEvent<T> = {
  type: ImxLinkInfoEventType;
  payload?: T;
};

export interface WalletConnectionInfoEvent {
  walletAddress: string;
  starkPublicKey: string;
  providerPreference: string;
  email: string;
  ethNetwork: string;
}
