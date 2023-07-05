import { TransactionResponse } from '@ethersproject/providers';
import {
  ApproveBridgeResponse,
  BridgeDepositResponse,
} from '@imtbl/bridge-sdk';
import { TokenInfo } from '@imtbl/checkout-sdk';

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

interface BridgeView {
  type: BridgeWidgetViews.BRIDGE;
  data?: PrefilledBridgeForm;
}

export interface PrefilledBridgeForm {
  fromAmount: string;
  fromContractAddress: string;
}

export interface BridgeSuccessView {
  type: BridgeWidgetViews.SUCCESS;
  data: {
    transactionHash: string;
  };
}

interface BridgeApproveERC20View {
  type: BridgeWidgetViews.APPROVE_ERC20;
  data: ApproveERC20BridgeData;
}

interface BridgeFailView {
  type: BridgeWidgetViews.FAIL;
  data: PrefilledBridgeForm;
  reason?: string;
}

interface BridgeInProgressView {
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
