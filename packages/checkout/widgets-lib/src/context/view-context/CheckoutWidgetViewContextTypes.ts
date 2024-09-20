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
  CheckoutFlowType,
  ConnectWidgetParams,
  ConnectWidgetConfiguration,
  WalletWidgetParams,
  WalletWidgetConfiguration,
} from '@imtbl/checkout-sdk';
import { ViewType } from './ViewType';

export type CheckoutWidgetView =
  | ConnectView
  | WalletView
  | AddFundsView
  | SaleView
  | SwapView
  | OnRampView
  | BrdigeView;

interface ConnectView extends ViewType {
  type: CheckoutFlowType.CONNECT;
  data: {
    params: ConnectWidgetParams;
    config: ConnectWidgetConfiguration;
  };
}

interface WalletView extends ViewType {
  type: CheckoutFlowType.WALLET;
  data: {
    params: WalletWidgetParams;
    config: WalletWidgetConfiguration;
  };
}

interface AddFundsView extends ViewType {
  type: CheckoutFlowType.ADD_FUNDS;
  data: {
    params: AddFundsWidgetParams;
    config: AddFundsWidgetConfiguration;
  };
}

interface SaleView extends ViewType {
  type: CheckoutFlowType.SALE;
  data: {
    params: Required<SaleWidgetParams>;
    config: SaleWidgetConfiguration;
  };
}

interface SwapView extends ViewType {
  type: CheckoutFlowType.SWAP;
  data: {
    params: SwapWidgetParams;
    config: SwapWidgetConfiguration;
  };
}

interface OnRampView extends ViewType {
  type: CheckoutFlowType.ONRAMP;
  data: {
    params: OnRampWidgetParams;
    config: OnrampWidgetConfiguration;
  };
}

interface BrdigeView extends ViewType {
  type: CheckoutFlowType.BRIDGE;
  data: {
    params: BridgeWidgetParams;
    config: BridgeWidgetConfiguration;
  };
}
