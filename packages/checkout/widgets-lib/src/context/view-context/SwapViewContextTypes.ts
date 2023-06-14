import { TokenInfo } from '@imtbl/checkout-sdk';
import { TransactionResponse } from '@ethersproject/providers';

export enum SwapWidgetViews {
  SWAP = 'SWAP',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  PRICE_SURGE = 'PRICE_SURGE',
}

export type SwapWidgetView =
  | SwapView
  | SwapInProgressView
  | { type: SwapWidgetViews.SUCCESS }
  | PriceSurgeView
  | SwapFailView;

interface SwapFailView {
  type: SwapWidgetViews.FAIL;
  data: PrefilledSwapForm;
  reason?: string;
}

interface PriceSurgeView {
  type: SwapWidgetViews.PRICE_SURGE;
  data: PrefilledSwapForm;
}

interface SwapView {
  type: SwapWidgetViews.SWAP;
  data?: PrefilledSwapForm;
}

export interface PrefilledSwapForm {
  fromAmount: string;
  fromContractAddress: string;
  toContractAddress: string;
}

interface SwapInProgressView {
  type: SwapWidgetViews.IN_PROGRESS;
  data: {
    token: TokenInfo;
    transactionResponse: TransactionResponse;
    swapForm: PrefilledSwapForm;
  };
}
