import { TransactionResponse } from '@ethersproject/providers';
import { Transaction } from 'ethers';

export enum SwapWidgetViews {
  SWAP = 'SWAP',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  PRICE_SURGE = 'PRICE_SURGE',
  APPROVE_ERC20 = 'APPROVE_ERC20',
}

export type SwapWidgetView =
  | SwapView
  | SwapInProgressView
  | { type: SwapWidgetViews.SUCCESS }
  | PriceSurgeView
  | SwapFailView
  | ApproveERC20View;

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
  data: ApproveERC20
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
export interface ApproveERC20 {
  approveSpendingTransaction: Transaction;
  swapTransaction: Transaction;
}
