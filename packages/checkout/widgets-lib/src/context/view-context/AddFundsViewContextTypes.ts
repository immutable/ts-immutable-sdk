import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { ViewType } from './ViewType';

export enum AddFundsWidgetViews {
  ADD_FUNDS = 'ADD_FUNDS',
  REVIEW = 'REVIEW',
  CONFIRMATION = 'CONFIRMATION',
}

export type AddFundsWidgetView = AddFundsView | AddFundsReview | AddFundsConfirmation;

interface AddFundsView extends ViewType {
  type: AddFundsWidgetViews.ADD_FUNDS;
}

interface AddFundsReview extends ViewType {
  type: AddFundsWidgetViews.REVIEW;
  data: AddFundsReviewData;
}

interface AddFundsConfirmation extends ViewType {
  type: AddFundsWidgetViews.CONFIRMATION;
  data: AddFundsConfirmationData;
}

export interface AddFundsReviewData {
  balance: TokenBalance;
  toAmount: string;
  toChainId: string;
  toTokenAddress: string;
}

export interface AddFundsConfirmationData {
  transactionHash: string;
}
