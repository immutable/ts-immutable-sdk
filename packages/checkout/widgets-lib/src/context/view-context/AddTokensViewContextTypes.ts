import { TokenBalance } from '@0xsquid/sdk/dist/types';
import { ViewType } from './ViewType';

export enum AddTokensWidgetViews {
  ADD_TOKENS = 'ADD_TOKENS',
  REVIEW = 'REVIEW',
  GEO_BLOCK_ERROR = 'GEO_BLOCK_ERROR',
}

export type AddTokensWidgetView = AddTokensView | AddTokensReview | GeoBlockErrorView;

interface AddTokensView extends ViewType {
  type: AddTokensWidgetViews.ADD_TOKENS;
}

interface AddTokensReview extends ViewType {
  type: AddTokensWidgetViews.REVIEW;
  data: AddTokensReviewData;
}

interface GeoBlockErrorView extends ViewType {
  type: AddTokensWidgetViews.GEO_BLOCK_ERROR;
}

export interface AddTokensReviewData {
  balance: TokenBalance;
  toAmount: string;
  toChainId: string;
  toTokenAddress: string;
  additionalBuffer: number;
}

export interface AddTokensConfirmationData {
  transactionHash: string;
}
