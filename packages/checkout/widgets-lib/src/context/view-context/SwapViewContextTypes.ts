import { TransactionRequest, TransactionResponse } from '@ethersproject/providers';
import { Quote } from '@imtbl/dex-sdk';
import { ViewType } from './ViewType';

export enum SwapWidgetViews {
  SWAP = 'SWAP',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  PRICE_SURGE = 'PRICE_SURGE',
  APPROVE_ERC20 = 'APPROVE_ERC20_SWAP',
}

export type SwapWidgetView =
  | SwapView
  | SwapInProgressView
  | SwapSuccessView
  | PriceSurgeView
  | SwapFailView
  | ApproveERC20View;

export interface SwapSuccessView extends ViewType {
  type: SwapWidgetViews.SUCCESS;
  data: {
    transactionHash: string;
  }
}
interface SwapFailView extends ViewType {
  type: SwapWidgetViews.FAIL;
  data: PrefilledSwapForm;
  reason?: string;
}

interface PriceSurgeView extends ViewType {
  type: SwapWidgetViews.PRICE_SURGE;
  data: PrefilledSwapForm;
}

interface SwapView extends ViewType {
  type: SwapWidgetViews.SWAP;
  data?: PrefilledSwapForm;
}

interface ApproveERC20View extends ViewType {
  type: SwapWidgetViews.APPROVE_ERC20,
  data: ApproveERC20SwapData
}

interface SwapInProgressView extends ViewType {
  type: SwapWidgetViews.IN_PROGRESS;
  data: {
    transactionResponse: TransactionResponse;
    swapForm: PrefilledSwapForm;
  }
}
export interface ApproveERC20SwapData {
  approveTransaction: TransactionRequest;
  transaction: TransactionRequest;
  info: Quote;
  swapFormInfo: PrefilledSwapForm;
}
export interface PrefilledSwapForm {
  fromAmount: string;
  fromContractAddress: string;
  toContractAddress: string;
}
