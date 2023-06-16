import { TransactionRequest, TransactionResponse } from '@ethersproject/providers';
import { TradeInfo, TransactionResponse as DexTransactionResponse } from '@imtbl/dex-sdk';

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

export interface SwapSuccessView {
  type: SwapWidgetViews.SUCCESS;
  data: {
    transactionHash: string;
  }
}
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

interface ApproveERC20View {
  type: SwapWidgetViews.APPROVE_ERC20,
  data: ApproveERC20SwapData
}

export interface PrefilledSwapForm {
  fromAmount: string;
  fromContractAddress: string;
  toContractAddress: string;
}

interface SwapInProgressView {
  type: SwapWidgetViews.IN_PROGRESS;
  data: {
    transactionResponse: TransactionResponse;
    swapForm: PrefilledSwapForm;
  }
}
export interface ApproveERC20SwapData extends DexTransactionResponse {
  approveTransaction: TransactionRequest;
  transaction: TransactionRequest;
  info: TradeInfo;
  swapFormInfo: PrefilledSwapForm;
}
