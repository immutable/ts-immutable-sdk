/* eslint-disable max-len */
import { WidgetLanguage, WidgetTheme } from '../configurations';
import { ConnectWidgetParams } from './connect';
import { BridgeWidgetParams } from './bridge';
import { WalletWidgetParams } from './wallet';
import { SwapWidgetParams } from './swap';
import { OnRampWidgetParams } from './onramp';
import { SaleWidgetParams } from './sale';

export enum CheckoutFlowType {
  CONNECT = 'connect',
  WALLET = 'wallet',
  SWAP = 'swap',
  BRIDGE = 'bridge',
  ONRAMP = 'onramp',
  SALE = 'sale',
}

export type CheckoutWidgetConnectFlowParams = {
  flow: CheckoutFlowType.CONNECT;
} & ConnectWidgetParams;

export type CheckoutWidgetWalletFlowParams = {
  flow: CheckoutFlowType.WALLET;
} & WalletWidgetParams;

export type CheckouWidgetSwapFlowParams = {
  flow: CheckoutFlowType.SWAP;
} & SwapWidgetParams;

export type CheckouWidgetBridgeFlowParams = {
  flow: CheckoutFlowType.BRIDGE;
} & BridgeWidgetParams;

export type CheckouWidgetOnRampFlowParams = {
  flow: CheckoutFlowType.ONRAMP;
} & OnRampWidgetParams;

export type CheckouWidgetSaleFlowParams = {
  flow: CheckoutFlowType.SALE;
} & SaleWidgetParams;

export type CheckoutWidgetFlowParams =
  | CheckoutWidgetConnectFlowParams
  | CheckoutWidgetWalletFlowParams
  | CheckouWidgetSwapFlowParams
  | CheckouWidgetBridgeFlowParams
  | CheckouWidgetOnRampFlowParams
  | CheckouWidgetSaleFlowParams;

export type CheckoutWidgetParams = {
  /** The language to use for the checkout widget */
  language?: WidgetLanguage;
  theme?: WidgetTheme;
} & CheckoutWidgetFlowParams;
