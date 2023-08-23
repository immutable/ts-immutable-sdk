import { ViewType } from './ViewType';

export enum PrimaryRevenueWidgetViews {
  PAYMENT_METHODS = 'PAYMENT_METHODS',
  PAY_WITH_CRYPTO = 'PAY_WITH_CRYPTO',
  PAY_WITH_CARD = 'PAY_WITH_CARD',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export type PrimaryRevenueWidgetView =
  | PrimaryRevenueMethodsView
  | PrimaryRevenueWithCryptoView
  | PrimaryRevenueWithCardView
  | PrimaryRevenueSuccessView
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
interface PrimaryRevenueFailView extends ViewType {
  type: PrimaryRevenueWidgetViews.FAIL;
  reason: string;
}
