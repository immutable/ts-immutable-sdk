import { TransactionResponse } from '@ethersproject/providers';
import { TokenInfo } from '@imtbl/checkout-sdk';

export enum BridgeWidgetViews {
  BRIDGE = 'BRIDGE',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  ERROR = 'ERROR',
}

export type BridgeWidgetView =
  | BridgeView
  | BridgeInProgressView
  | { type: BridgeWidgetViews.SUCCESS }
  | BridgeFailView;

interface BridgeView {
  type: BridgeWidgetViews.BRIDGE;
  data?: PrefilledBridgeForm;
}

export interface PrefilledBridgeForm {
  amount: string;
  tokenAddress: string;
}

interface BridgeFailView {
  type: BridgeWidgetViews.FAIL;
  data: PrefilledBridgeForm;
}

interface BridgeInProgressView {
  type: BridgeWidgetViews.IN_PROGRESS;
  data: {
    token: TokenInfo,
    transactionResponse: TransactionResponse,
    bridgeForm: PrefilledBridgeForm,
  };
}
