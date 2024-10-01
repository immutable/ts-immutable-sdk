/* eslint-disable max-len */
import { WidgetLanguage, WidgetTheme } from '../configurations';
import { ConnectWidgetParams } from './connect';
import { BridgeWidgetParams } from './bridge';
import { WalletWidgetParams } from './wallet';
import { SwapWidgetParams } from './swap';
import { OnRampWidgetParams } from './onramp';
import { SaleWidgetParams } from './sale';
import { AddFundsWidgetParams } from './addFunds';

export enum CheckoutFlowType {
  CONNECT = 'CONNECT',
  WALLET = 'WALLET',
  SALE = 'SALE',
  SWAP = 'SWAP',
  BRIDGE = 'BRIDGE',
  ONRAMP = 'ONRAMP',
  ADD_FUNDS = 'ADD_FUNDS',
}

export type CheckoutWidgetConnectFlowParams = {
  flow: CheckoutFlowType.CONNECT;
} & ConnectWidgetParams;

export type CheckoutWidgetWalletFlowParams = {
  flow: CheckoutFlowType.WALLET;
} & WalletWidgetParams;

export type CheckoutWidgetSwapFlowParams = {
  flow: CheckoutFlowType.SWAP;
} & SwapWidgetParams;

export type CheckoutWidgetBridgeFlowParams = {
  flow: CheckoutFlowType.BRIDGE;
} & BridgeWidgetParams;

export type CheckoutWidgetOnRampFlowParams = {
  flow: CheckoutFlowType.ONRAMP;
} & OnRampWidgetParams;

export type CheckoutWidgetSaleFlowParams = {
  flow: CheckoutFlowType.SALE;
} & SaleWidgetParams;

export type CheckoutWidgetAddFundsFlowParams = {
  flow: CheckoutFlowType.ADD_FUNDS;
} & AddFundsWidgetParams;

export type CheckoutWidgetFlowParams =
  | CheckoutWidgetConnectFlowParams
  | CheckoutWidgetWalletFlowParams
  | CheckoutWidgetSwapFlowParams
  | CheckoutWidgetBridgeFlowParams
  | CheckoutWidgetOnRampFlowParams
  | CheckoutWidgetSaleFlowParams
  | CheckoutWidgetAddFundsFlowParams;

export type CheckoutWidgetParams = {
  /** The language to use for the checkout widget */
  language?: WidgetLanguage;
  theme?: WidgetTheme;
} & CheckoutWidgetFlowParams;
