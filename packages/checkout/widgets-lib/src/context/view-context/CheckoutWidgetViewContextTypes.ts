import {
  BridgeWidgetConfiguration,
  BridgeWidgetParams,
  OnrampWidgetConfiguration,
  OnRampWidgetParams,
  SaleWidgetConfiguration,
  SaleWidgetParams,
  SwapWidgetConfiguration,
  SwapWidgetParams,
  AddFundsWidgetParams,
  AddFundsWidgetConfiguration,
} from '@imtbl/checkout-sdk';
import { ViewType } from './ViewType';

export enum CheckoutWidgetViews {
  SALE = 'SALE',
  ADD_FUNDS = 'ADD_FUNDS',
  SWAP = 'SWAP',
  ONRAMP = 'ONRAMP',
  BRIDGE = 'BRIDGE',
}

export type CheckoutWidgetView =
  | AddFundsView
  | SaleView
  | SwapView
  | OnRampView
  | BrdigeView;

interface AddFundsView extends ViewType {
  type: CheckoutWidgetViews.SALE;
  data: {
    params: AddFundsWidgetParams;
    config: AddFundsWidgetConfiguration;
  };
}

interface SaleView extends ViewType {
  type: CheckoutWidgetViews.ADD_FUNDS;
  data: {
    params: SaleWidgetParams;
    config: SaleWidgetConfiguration;
  };
}

interface SwapView extends ViewType {
  type: CheckoutWidgetViews.SWAP;
  data: {
    params: SwapWidgetParams;
    config: SwapWidgetConfiguration;
  };
}

interface OnRampView extends ViewType {
  type: CheckoutWidgetViews.ONRAMP;
  data: {
    params: OnRampWidgetParams;
    config: OnrampWidgetConfiguration;
  };
}

interface BrdigeView extends ViewType {
  type: CheckoutWidgetViews.BRIDGE;
  data: {
    params: BridgeWidgetParams;
    config: BridgeWidgetConfiguration;
  };
}
