import { SmartCheckoutResult } from '@imtbl/checkout-sdk';
import { SignResponse } from '../../widgets/primary-revenue/hooks/useSignOrder';
import { ViewType } from './ViewType';

export enum PrimaryRevenueWidgetViews {
  PAYMENT_METHODS = 'PAYMENT_METHODS',
  PAY_WITH_CRYPTO = 'PAY_WITH_CRYPTO',
  PAY_WITH_CARD = 'PAY_WITH_CARD',
  SMART_CHECKOUT = 'SMART_CHECKOUT',
  REVIEW_ORDER = 'REVIEW_ORDER',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  SWAP = 'SWAP',
  FUND_WITH_SMART_CHECKOUT = 'FUND_WITH_SMART_CHECKOUT',
}

export type PrimaryRevenueWidgetView =
  | PrimaryRevenueMethodsView
  | PrimaryRevenueWithCryptoView
  | PrimaryRevenueWithCardView
  | PrimaryRevenueSuccessView
  | PrimaryRevenueReviewOrderView
  | PrimaryRevenueSmartCheckoutView
  | PrimaryRevenueSwapView
  | PrimaryRevenueFundWithSmartCheckoutView
  | PrimaryRevenueFailView;

interface PrimaryRevenueMethodsView extends ViewType {
  type: PrimaryRevenueWidgetViews.PAYMENT_METHODS;
}
interface PrimaryRevenueWithCryptoView extends ViewType {
  type: PrimaryRevenueWidgetViews.PAY_WITH_CRYPTO;
}
interface PrimaryRevenueWithCardView extends ViewType {
  type: PrimaryRevenueWidgetViews.PAY_WITH_CARD;
}
interface PrimaryRevenueSuccessView extends ViewType {
  type: PrimaryRevenueWidgetViews.SUCCESS;
}
interface PrimaryRevenueReviewOrderView extends ViewType {
  type: PrimaryRevenueWidgetViews.REVIEW_ORDER;
}
interface PrimaryRevenueFailView extends ViewType {
  type: PrimaryRevenueWidgetViews.FAIL;
  reason?: string;
}
interface PrimaryRevenueSmartCheckoutView extends ViewType {
  type: PrimaryRevenueWidgetViews.SMART_CHECKOUT;
}
interface PrimaryRevenueSwapView extends ViewType {
  type: PrimaryRevenueWidgetViews.SWAP;
}
interface PrimaryRevenueFundWithSmartCheckoutView extends ViewType {
  type: PrimaryRevenueWidgetViews.FUND_WITH_SMART_CHECKOUT;
  data: FundWithSmartCheckoutData;
}

export type FundWithSmartCheckoutData =
  | FundWithSmartCheckoutInit
  | FundWithSmartCheckoutSelect
  | FundWithSmartCheckoutFundingRoute;

export enum FundWithSmartCheckoutSubViews {
  INIT = 'INIT',
  SELECT = 'SELECT',
  FUNDING_ROUTE = 'FUNDING_ROUTE',
}

interface FundWithSmartCheckoutInit {
  type: FundWithSmartCheckoutSubViews.INIT,
  signResponse?: SignResponse,
  smartCheckoutResult?: SmartCheckoutResult | void,
}

interface FundWithSmartCheckoutSelect {
  type: FundWithSmartCheckoutSubViews.SELECT;
}

interface FundWithSmartCheckoutFundingRoute {
  type: FundWithSmartCheckoutSubViews.FUNDING_ROUTE;
  fundingRoute: any

}
