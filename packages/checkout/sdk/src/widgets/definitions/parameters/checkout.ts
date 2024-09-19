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

export type CheckouWidgetAddFundsFlowParams = {
  flow: CheckoutFlowType.ADD_FUNDS;
} & AddFundsWidgetParams;

export type CheckoutWidgetFlowParams =
  | CheckoutWidgetConnectFlowParams
  | CheckoutWidgetWalletFlowParams
  | CheckouWidgetSwapFlowParams
  | CheckouWidgetBridgeFlowParams
  | CheckouWidgetOnRampFlowParams
  | CheckouWidgetSaleFlowParams
  | CheckouWidgetAddFundsFlowParams;

export type CheckoutWidgetParams = {
  /** The language to use for the checkout widget */
  language?: WidgetLanguage;
  theme?: WidgetTheme;
} & CheckoutWidgetFlowParams;
