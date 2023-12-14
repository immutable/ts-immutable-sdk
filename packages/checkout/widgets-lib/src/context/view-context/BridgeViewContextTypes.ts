import { ApproveBridgeResponse, BridgeTxResponse } from '@imtbl/bridge-sdk';
import { ViewType } from './ViewType';

export enum BridgeWidgetViews {
  WALLET_NETWORK_SELECTION = 'WALLET_NETWORK_SELECTION',
  BRIDGE_FORM = 'BRIDGE_FORM',
  BRIDGE_REVIEW = 'BRIDGE_REVIEW',
  IN_PROGRESS = 'IN_PROGRESS',
  BRIDGE_FAILURE = 'BRIDGE_FAILURE',
  APPROVE_TRANSACTION = 'APPROVE_TRANSACTION',
}

export type BridgeWidgetView =
  | BridgeCrossWalletSelection
  | BridgeForm
  | BridgeReview
  | BridgeInProgress
  | BridgeFailure
  | BridgeApproveTransaction;

interface BridgeCrossWalletSelection extends ViewType {
  type: BridgeWidgetViews.WALLET_NETWORK_SELECTION,
}

interface BridgeForm extends ViewType {
  type: BridgeWidgetViews.BRIDGE_FORM,
}

interface BridgeReview extends ViewType {
  type: BridgeWidgetViews.BRIDGE_REVIEW,
}

interface BridgeInProgress extends ViewType {
  type: BridgeWidgetViews.IN_PROGRESS,
  transactionHash: string,
}

interface BridgeFailure extends ViewType {
  type: BridgeWidgetViews.BRIDGE_FAILURE,
  reason: string;
}

interface BridgeApproveTransaction extends ViewType {
  type: BridgeWidgetViews.APPROVE_TRANSACTION,
  approveTransaction: ApproveBridgeResponse;
  transaction: BridgeTxResponse;
}
