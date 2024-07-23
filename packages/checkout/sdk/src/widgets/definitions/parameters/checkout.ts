/* eslint-disable max-len */
import { WidgetLanguage } from '../configurations';
import { ConnectWidgetParams } from './connect';
import { WalletWidgetParams } from './wallet';

export enum CheckoutFlowType {
  CONNECT = 'connect',
  WALLET = 'wallet',
}

export type CheckoutWidgetConnectFlow = { flow: CheckoutFlowType.CONNECT } & ConnectWidgetParams;

export type CheckoutWidgetWalletFlow = { flow: CheckoutFlowType.WALLET } & WalletWidgetParams;

export type CheckoutWidgetFlow = CheckoutWidgetConnectFlow | CheckoutWidgetWalletFlow;

export type CheckoutWidgetParams = {
  /** The language to use for the checkout widget */
  language?: WidgetLanguage;
} & CheckoutWidgetFlow;
