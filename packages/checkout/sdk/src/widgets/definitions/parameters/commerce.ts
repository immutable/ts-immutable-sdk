/* eslint-disable max-len */
import { WidgetLanguage, WidgetTheme } from '../configurations';
import { ConnectWidgetParams } from './connect';
import { BridgeWidgetParams } from './bridge';
import { WalletWidgetParams } from './wallet';
import { SwapWidgetParams } from './swap';
import { OnRampWidgetParams } from './onramp';
import { SaleWidgetParams } from './sale';
import { AddTokensWidgetParams } from './addTokens';

export enum CommerceFlowType {
  CONNECT = 'CONNECT',
  WALLET = 'WALLET',
  SALE = 'SALE',
  SWAP = 'SWAP',
  BRIDGE = 'BRIDGE',
  ONRAMP = 'ONRAMP',
  ADD_TOKENS = 'ADD_TOKENS',
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

export type CommerceWidgetAddTokensFlowParams = {
  flow: CommerceFlowType.ADD_TOKENS;
} & AddTokensWidgetParams;

export type CommerceWidgetFlowParams =
  | CommerceWidgetConnectFlowParams
  | CommerceWidgetWalletFlowParams
  | CommerceWidgetSwapFlowParams
  | CommerceWidgetBridgeFlowParams
  | CommerceWidgetOnRampFlowParams
  | CommerceWidgetSaleFlowParams
  | CommerceWidgetAddTokensFlowParams;

export type CommerceWidgetParams = {
  /** The language to use for the Commerce Widget */
  language?: WidgetLanguage;
  theme?: WidgetTheme;
} & CommerceWidgetFlowParams;
