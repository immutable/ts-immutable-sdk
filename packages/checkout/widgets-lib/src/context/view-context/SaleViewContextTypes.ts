import { SaleErrorTypes } from '../../widgets/sale/types';
import { ViewType } from './ViewType';

export enum SaleWidgetViews {
  PAYMENT_METHODS = 'PAYMENT_METHODS',
  PAY_WITH_COINS = 'PAY_WITH_COINS',
  PAY_WITH_CARD = 'PAY_WITH_CARD',
  ORDER_SUMMARY = 'ORDER_SUMMARY',
  SALE_SUCCESS = 'SALE_SUCCESS',
  SALE_FAIL = 'SALE_FAIL',
}

export type SaleWidgetView =
  | SaleMethodsView
  | SaleWithCoinsView
  | SaleWithCardView
  | OrderSummaryView
  | SaleSuccessView
  | SaleFailView;

interface SaleMethodsView extends ViewType {
  type: SaleWidgetViews.PAYMENT_METHODS;
  data?: {
    showInsufficientCoinsBanner?: boolean;
  }
}
interface SaleWithCoinsView extends ViewType {
  type: SaleWidgetViews.PAY_WITH_COINS;
}
interface SaleWithCardView extends ViewType {
  type: SaleWidgetViews.PAY_WITH_CARD;
}

interface OrderSummaryView extends ViewType {
  type: SaleWidgetViews.ORDER_SUMMARY;
  subView: OrderSummarySubViews;
}
interface SaleSuccessView extends ViewType {
  type: SaleWidgetViews.SALE_SUCCESS;
}
interface SaleFailView extends ViewType {
  type: SaleWidgetViews.SALE_FAIL;
  data?: {
    errorType: SaleErrorTypes;
    transactionHash?: string;
    [key: string]: unknown;
  };
}

export enum OrderSummarySubViews {
  INIT = 'INIT',
  REVIEW_ORDER = 'REVIEW_ORDER',
  EXECUTE_FUNDING_ROUTE = 'EXECUTE_FUNDING_ROUTE',
}
