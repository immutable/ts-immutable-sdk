import {
  BridgeWidgetConfiguration,
  BridgeWidgetParams,
  OnrampWidgetConfiguration,
  OnRampWidgetParams,
  SaleWidgetConfiguration,
  SaleWidgetParams,
  SwapWidgetConfiguration,
  SwapWidgetParams,
  AddTokensWidgetParams,
  AddTokensWidgetConfiguration,
  CommerceFlowType,
  ConnectWidgetParams,
  ConnectWidgetConfiguration,
  WalletWidgetParams,
  WalletWidgetConfiguration,
  PurchaseWidgetConfiguration,
  PurchaseWidgetParams,
} from '@imtbl/checkout-sdk';
import { ViewType } from './ViewType';

export type CheckoutWidgetView =
  | ConnectView
  | WalletView
  | AddTokensView
  | SaleView
  | SwapView
  | OnRampView
  | BridgeView
  | PurchaseView;

interface ConnectView extends ViewType {
  type: CommerceFlowType.CONNECT;
  data: {
    params: ConnectWidgetParams;
    config: ConnectWidgetConfiguration;
  };
}

interface WalletView extends ViewType {
  type: CommerceFlowType.WALLET;
  data: {
    params: WalletWidgetParams;
    config: WalletWidgetConfiguration;
  };
}

interface AddTokensView extends ViewType {
  type: CommerceFlowType.ADD_TOKENS;
  data: {
    params: AddTokensWidgetParams;
    config: AddTokensWidgetConfiguration;
  };
}

interface PurchaseView extends ViewType {
  type: CommerceFlowType.PURCHASE;
  data: {
    params: PurchaseWidgetParams & {
      environmentId: string;
    };
    config: PurchaseWidgetConfiguration;
  };
}

interface SaleView extends ViewType {
  type: CommerceFlowType.SALE;
  data: {
    params: Required<SaleWidgetParams>;
    config: SaleWidgetConfiguration;
  };
}

interface SwapView extends ViewType {
  type: CommerceFlowType.SWAP;
  data: {
    params: SwapWidgetParams;
    config: SwapWidgetConfiguration;
  };
}

interface OnRampView extends ViewType {
  type: CommerceFlowType.ONRAMP;
  data: {
    params: OnRampWidgetParams;
    config: OnrampWidgetConfiguration;
  };
}

interface BridgeView extends ViewType {
  type: CommerceFlowType.BRIDGE;
  data: {
    params: BridgeWidgetParams;
    config: BridgeWidgetConfiguration;
  };
}
