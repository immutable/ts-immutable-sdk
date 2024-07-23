/* eslint-disable max-len */
import { WidgetLanguage } from '../configurations';

export enum CheckoutFlowType {
  CONNECT = 'connect',
  WALLET = 'wallet',
}

export type CheckoutWidgetConnectFlow = {
  flow: CheckoutFlowType.CONNECT
  walletRdns: string,
};

export type CheckoutWidgetWalletFlow = {
  flow: CheckoutFlowType.WALLET
  showDisconnectButton: boolean,
};

export type CheckoutWidgetParams = {
  /** The language to use for the checkout widget */
  language?: WidgetLanguage;
} & (CheckoutWidgetConnectFlow | CheckoutWidgetWalletFlow);
