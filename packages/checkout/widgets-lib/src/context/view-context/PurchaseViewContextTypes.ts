import { ViewType } from './ViewType';

export enum PurchaseWidgetViews {
  PURCHASE = 'PURCHASE',
  REVIEW = 'REVIEW',
  PAY_WITH_CARD = 'PAY_WITH_CARD',
  GEO_BLOCK_ERROR = 'GEO_BLOCK_ERROR',
}

export type PurchaseWidgetView = PurchaseView | PurchaseReview | GeoBlockErrorView | PurchaseWithCardView;

interface PurchaseView extends ViewType {
  type: PurchaseWidgetViews.PURCHASE;
}

interface PurchaseReview extends ViewType {
  type: PurchaseWidgetViews.REVIEW;
  data: PurchaseReviewData;
}

interface PurchaseWithCardView extends ViewType {
  type: PurchaseWidgetViews.PAY_WITH_CARD;
}

interface GeoBlockErrorView extends ViewType {
  type: PurchaseWidgetViews.GEO_BLOCK_ERROR;
}

export interface PurchaseReviewData {}
