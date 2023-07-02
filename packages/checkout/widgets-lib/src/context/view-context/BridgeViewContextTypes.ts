import { TransactionResponse } from '@ethersproject/providers';
import { ApproveBridgeResponse, BridgeDepositResponse } from '@imtbl/bridge-sdk';
import { TokenInfo } from '@imtbl/checkout-sdk';
import { ViewType } from './ViewType';

export enum BridgeWidgetViews {
  BRIDGE = 'BRIDGE',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  ERROR = 'ERROR',
  APPROVE_ERC20 = 'APPROVE_ERC20_BRIDGE',
}

export type BridgeWidgetView =
  | BridgeView
  | BridgeInProgressView
  | BridgeSuccessView
  | BridgeFailView
  | BridgeApproveERC20View;

interface BridgeView extends ViewType {
  type: BridgeWidgetViews.BRIDGE;
  data?: PrefilledBridgeForm;
}

export interface BridgeSuccessView extends ViewType {
  type: BridgeWidgetViews.SUCCESS,
  data: {
    transactionHash: string;
  }
}

interface BridgeApproveERC20View extends ViewType {
  type: BridgeWidgetViews.APPROVE_ERC20,
  data: ApproveERC20BridgeData
}

interface BridgeFailView extends ViewType {
  type: BridgeWidgetViews.FAIL;
  data: PrefilledBridgeForm;
  reason?: string;
}

interface BridgeInProgressView extends ViewType {
  type: BridgeWidgetViews.IN_PROGRESS;
  data: {
    token: TokenInfo;
    transactionResponse: TransactionResponse;
    bridgeForm: PrefilledBridgeForm;
  };
}

export interface ApproveERC20BridgeData {
  approveTransaction: ApproveBridgeResponse;
  transaction: BridgeDepositResponse;
  bridgeFormInfo: PrefilledBridgeForm;
}

export interface PrefilledBridgeForm {
  amount: string;
  tokenAddress: string;
}
