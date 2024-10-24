/* eslint-disable max-len */
import { WidgetLanguage, WidgetTheme } from '../configurations';
import { ConnectWidgetParams } from './connect';
import { BridgeWidgetParams } from './bridge';
import { WalletWidgetParams } from './wallet';
import { SwapWidgetParams } from './swap';
import { OnRampWidgetParams } from './onramp';
import { SaleWidgetParams } from './sale';
import { AddFundsWidgetParams } from './addFunds';

export enum CommerceFlowType {
  CONNECT = 'CONNECT',
  WALLET = 'WALLET',
  SALE = 'SALE',
  SWAP = 'SWAP',
  BRIDGE = 'BRIDGE',
  ONRAMP = 'ONRAMP',
  ADD_FUNDS = 'ADD_FUNDS',
}

export type CommerceWidgetConnectFlowParams = {
  flow: CommerceFlowType.CONNECT;
} & ConnectWidgetParams;

export type CommerceWidgetWalletFlowParams = {
  flow: CommerceFlowType.WALLET;
} & WalletWidgetParams;

export type CommerceWidgetSwapFlowParams = {
  flow: CommerceFlowType.SWAP;
} & SwapWidgetParams;

export type CommerceWidgetBridgeFlowParams = {
  flow: CommerceFlowType.BRIDGE;
} & BridgeWidgetParams;

export type CommerceWidgetOnRampFlowParams = {
  flow: CommerceFlowType.ONRAMP;
} & OnRampWidgetParams;

export type CommerceWidgetSaleFlowParams = {
  flow: CommerceFlowType.SALE;
} & SaleWidgetParams;

export type CommerceWidgetAddFundsFlowParams = {
  flow: CommerceFlowType.ADD_FUNDS;
} & AddFundsWidgetParams;

export type CommerceWidgetFlowParams =
  | CommerceWidgetConnectFlowParams
  | CommerceWidgetWalletFlowParams
  | CommerceWidgetSwapFlowParams
  | CommerceWidgetBridgeFlowParams
  | CommerceWidgetOnRampFlowParams
  | CommerceWidgetSaleFlowParams
  | CommerceWidgetAddFundsFlowParams;

export type CommerceWidgetParams = {
  /** The language to use for the Commerce Widget */
  language?: WidgetLanguage;
  theme?: WidgetTheme;
} & CommerceWidgetFlowParams;
