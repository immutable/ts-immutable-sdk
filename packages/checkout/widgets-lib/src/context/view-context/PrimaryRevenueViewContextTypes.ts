import { ViewType } from './ViewType';

export enum PrimaryRevenueWidgetViews {
  PAYMENT_METHODS = 'PAYMENT_METHODS',
  PAY_WITH_COINS = 'PAY_WITH_COINS',
  PAY_WITH_CARD = 'PAY_WITH_CARD',
  SMART_CHECKOUT = 'SMART_CHECKOUT',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export type PrimaryRevenueWidgetView =
  | PrimaryRevenueMethodsView
  | PrimaryRevenueWithCoinsView
  | PrimaryRevenueWithCardView
  | PrimaryRevenueSmartCheckoutView
  | PrimaryRevenueSuccessView
  | PrimaryRevenueFailView;

interface PrimaryRevenueMethodsView extends ViewType {
  type: PrimaryRevenueWidgetViews.PAYMENT_METHODS;
}
interface PrimaryRevenueWithCoinsView extends ViewType {
  type: PrimaryRevenueWidgetViews.PAY_WITH_COINS;
}
interface PrimaryRevenueWithCardView extends ViewType {
  type: PrimaryRevenueWidgetViews.PAY_WITH_CARD;
}
interface PrimaryRevenueSmartCheckoutView extends ViewType {
  type: PrimaryRevenueWidgetViews.SMART_CHECKOUT;
}
interface PrimaryRevenueSuccessView extends ViewType {
  type: PrimaryRevenueWidgetViews.SUCCESS;
}
interface PrimaryRevenueFailView extends ViewType {
  type: PrimaryRevenueWidgetViews.FAIL;
  reason?: string;
}
