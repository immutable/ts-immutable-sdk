import { ApproveBridgeResponse, BridgeTxResponse } from '@imtbl/bridge-sdk';
import { Transaction } from '../../lib/clients';
import { ViewType } from './ViewType';
import { TransactionResponse } from 'ethers';

export enum BridgeWidgetViews {
  WALLET_NETWORK_SELECTION = 'WALLET_NETWORK_SELECTION',
  BRIDGE_FORM = 'BRIDGE_FORM',
  BRIDGE_REVIEW = 'BRIDGE_REVIEW',
  IN_PROGRESS = 'IN_PROGRESS',
  BRIDGE_FAILURE = 'BRIDGE_FAILURE',
  APPROVE_TRANSACTION = 'APPROVE_TRANSACTION',
  TRANSACTIONS = 'TRANSACTIONS',
  CLAIM_WITHDRAWAL = 'CLAIM_WITHDRAWAL',
  CLAIM_WITHDRAWAL_IN_PROGRESS = 'CLAIM_WITHDRAWAL_IN_PROGRESS',
  CLAIM_WITHDRAWAL_SUCCESS = 'CLAIM_WITHDRAWAL_SUCCESS',
  CLAIM_WITHDRAWAL_FAILURE = 'CLAIM_WITHDRAWAL_FAILURE',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export type BridgeWidgetView =
  | BridgeCrossWalletSelection
  | BridgeForm
  | BridgeReview
  | BridgeInProgress
  | BridgeFailure
  | BridgeApproveTransaction
  | BridgeTransactions
  | BridgeClaimWithdrawal
  | BridgeClaimWithdrawalInProgress
  | BridgeClaimWithdrawalSuccess
  | BridgeClaimWithdrawalFailure
  | BridgeServiceUnavailableView;

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
  isTransfer: boolean,
}

interface BridgeFailure extends ViewType {
  type: BridgeWidgetViews.BRIDGE_FAILURE,
  reason: string;
}

interface BridgeApproveTransaction extends ViewType {
  type: BridgeWidgetViews.APPROVE_TRANSACTION,
  approveTransaction: ApproveBridgeResponse | undefined;
  transaction: BridgeTxResponse | undefined;
}

interface BridgeTransactions extends ViewType {
  type: BridgeWidgetViews.TRANSACTIONS,
}

interface BridgeClaimWithdrawal extends ViewType {
  type: BridgeWidgetViews.CLAIM_WITHDRAWAL,
  transaction: Transaction
}

interface BridgeClaimWithdrawalInProgress extends ViewType {
  type: BridgeWidgetViews.CLAIM_WITHDRAWAL_IN_PROGRESS,
  transactionResponse: TransactionResponse;
}

export interface BridgeClaimWithdrawalSuccess extends ViewType {
  type: BridgeWidgetViews.CLAIM_WITHDRAWAL_SUCCESS,
  transactionHash: string;
}

export interface BridgeClaimWithdrawalFailure extends ViewType {
  type: BridgeWidgetViews.CLAIM_WITHDRAWAL_FAILURE,
  transactionHash: string;
  reason: string;
}

export interface BridgeServiceUnavailableView extends ViewType {
  type: BridgeWidgetViews.SERVICE_UNAVAILABLE;
}
