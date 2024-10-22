import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { ViewType } from './ViewType';

export enum AddFundsWidgetViews {
  ADD_FUNDS = 'ADD_FUNDS',
  REVIEW = 'REVIEW',
  GEO_BLOCK_ERROR = 'GEO_BLOCK_ERROR',
}

export type AddFundsWidgetView = AddFundsView | AddFundsReview | GeoBlockErrorView;

interface AddFundsView extends ViewType {
  type: AddFundsWidgetViews.ADD_FUNDS;
}

interface AddFundsReview extends ViewType {
  type: AddFundsWidgetViews.REVIEW;
  data: AddFundsReviewData;
}

interface GeoBlockErrorView extends ViewType {
  type: AddFundsWidgetViews.GEO_BLOCK_ERROR;
}

export interface AddFundsReviewData {
  balance: TokenBalance;
  toAmount: string;
  toChainId: string;
  toTokenAddress: string;
  additionalBuffer: number;
}

export interface AddFundsConfirmationData {
  transactionHash: string;
}
