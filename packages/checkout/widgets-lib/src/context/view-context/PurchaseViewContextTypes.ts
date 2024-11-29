import { ViewType } from './ViewType';

export enum PurchaseWidgetViews {
  PURCHASE = 'PURCHASE',
  REVIEW = 'REVIEW',
  GEO_BLOCK_ERROR = 'GEO_BLOCK_ERROR',
}

export type PurchaseWidgetView = PurchaseView | PurchaseReview | GeoBlockErrorView;

interface PurchaseView extends ViewType {
  type: PurchaseWidgetViews.PURCHASE;
}

interface PurchaseReview extends ViewType {
  type: PurchaseWidgetViews.REVIEW;
  data: PurchaseReviewData;
}

interface GeoBlockErrorView extends ViewType {
  type: PurchaseWidgetViews.GEO_BLOCK_ERROR;
}

export interface PurchaseReviewData {}
