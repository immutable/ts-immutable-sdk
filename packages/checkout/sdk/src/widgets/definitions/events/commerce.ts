import { Web3Provider } from '@ethersproject/providers';
import { ConnectionFailed, ConnectionSuccess } from './connect';
import {
  SaleFailed,
  SalePaymentMethod,
  SalePaymentToken,
  SaleSuccess,
  SaleTransactionSuccess,
} from './sale';
import { EIP6963ProviderInfo, WalletProviderName } from '../../../types';
import { OnRampFailed, OnRampSuccess } from './onramp';
import {
  BridgeClaimWithdrawalFailed,
  BridgeClaimWithdrawalSuccess,
  BridgeFailed,
  BridgeTransactionSent,
} from './bridge';
import { SwapFailed, SwapRejected, SwapSuccess } from './swap';
import { WalletNetworkSwitch } from './wallet';
import { AddFundsFailed, AddFundsSuccess, AddFundsConnectSuccess } from './addFunds';

export enum CommerceEventType {
  INITIALISED = 'INITIALISED',
  PROVIDER_UPDATED = 'PROVIDER_UPDATED',
  CLOSE = 'CLOSE',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  DISCONNECTED = 'DISCONNECTED',
  USER_ACTION = 'USER_ACTION',
}

export enum CommerceSuccessEventType {
  SWAP_SUCCESS = 'SWAP_SUCCESS',
  ONRAMP_SUCCESS = 'ONRAMP_SUCCESS',
  CONNECT_SUCCESS = 'CONNECT_SUCCESS',
  SALE_SUCCESS = 'SALE_SUCCESS',
  SALE_TRANSACTION_SUCCESS = 'SALE_TRANSACTION_SUCCESS',
  BRIDGE_SUCCESS = 'BRIDGE_SUCCESS',
  BRIDGE_CLAIM_WITHDRAWAL_SUCCESS = 'BRIDGE_CLAIM_WITHDRAWAL_SUCCESS',
  ADD_FUNDS_SUCCESS = 'ADD_FUNDS_SUCCESS',
}

export enum CommerceFailureEventType {
  BRIDGE_FAILED = 'BRIDGE_FAILED',
  BRIDGE_CLAIM_WITHDRAWAL_FAILED = 'BRIDGE_CLAIM_WITHDRAWAL_FAILED',
  SWAP_FAILED = 'SWAP_FAILED',
  SWAP_REJECTED = 'SWAP_REJECTED',
  CONNECT_FAILED = 'CONNECT_FAILED',
  SALE_FAILED = 'SALE_FAILED',
  ONRAMP_FAILED = 'ONRAMP_FAILED',
  ADD_FUNDS_FAILED = 'ADD_FUNDS_FAILED',
}

export enum CommerceUserActionEventType {
  PAYMENT_METHOD_SELECTED = 'PAYMENT_METHOD_SELECTED',
  PAYMENT_TOKEN_SELECTED = 'PAYMENT_TOKEN_SELECTED',
  NETWORK_SWITCH = 'NETWORK_SWITCH',
}

export type CommerceProviderUpdatedEvent = {
  /** The connected provider. */
  provider: Web3Provider;
  /** The wallet provider name of the connected provider. */
  walletProviderName: WalletProviderName | undefined;
  /** The wallet provider EIP-6963 metadata. */
  walletProviderInfo: EIP6963ProviderInfo | undefined;
};

export type CommerceSaleSuccessEvent = {
  type: CommerceSuccessEventType.SALE_SUCCESS;
  data: SaleSuccess;
};

export type CommerceSaleSuccessfulTransactionEvent = {
  type: CommerceSuccessEventType.SALE_TRANSACTION_SUCCESS;
  data: SaleTransactionSuccess;
};

export type CommerceOnRampSuccessEvent = {
  type: CommerceSuccessEventType.ONRAMP_SUCCESS;
  data: OnRampSuccess;
}; // FIMXE: TransactionSent

export type CommerceBridgeSuccessEvent = {
  type: CommerceSuccessEventType.BRIDGE_SUCCESS;
  data: BridgeTransactionSent;
}; // FIMXE: TransactionSent

export type CommerceBridgeClaimWithdrawalSuccessEvent = {
  type: CommerceSuccessEventType.BRIDGE_CLAIM_WITHDRAWAL_SUCCESS;
  data: BridgeClaimWithdrawalSuccess;
}; // FIMXE: TransactionSent

export type CommerceSwapSuccessEvent = {
  type: CommerceSuccessEventType.SWAP_SUCCESS;
  data: SwapSuccess;
}; // FIMXE: TransactionSent

export type CommerceConnectSuccessEvent = {
  type: CommerceSuccessEventType.CONNECT_SUCCESS;
  data: ConnectionSuccess;
};

export type CommerceAddFundsSuccessEvent = {
  type: CommerceSuccessEventType.ADD_FUNDS_SUCCESS;
  data: AddFundsSuccess;
};

export type CommerceAddFundsConnectSuccessEvent = {
  type: CommerceSuccessEventType.CONNECT_SUCCESS;
  data: AddFundsConnectSuccess;
};

export type CommerceSuccessEvent =
  | CommerceAddFundsSuccessEvent
  | CommerceAddFundsConnectSuccessEvent
  | CommerceConnectSuccessEvent
  | CommerceBridgeSuccessEvent
  | CommerceBridgeClaimWithdrawalSuccessEvent
  | CommerceOnRampSuccessEvent
  | CommerceSwapSuccessEvent
  | CommerceSaleSuccessEvent
  | CommerceSaleSuccessfulTransactionEvent;

export type CommerceBridgeFailureEvent = {
  type: CommerceFailureEventType.BRIDGE_FAILED;
  data: BridgeFailed;
}; // FIMXE: Error

export type CommerceBridgeClaimWithdrawalFailedEvent = {
  type: CommerceFailureEventType.BRIDGE_CLAIM_WITHDRAWAL_FAILED;
  data: BridgeClaimWithdrawalFailed;
}; // FIMXE: Error

export type CommerceConnectFailureEvent = {
  type: CommerceFailureEventType.CONNECT_FAILED;
  data: ConnectionFailed;
}; // FIMXE: Error

export type CommerceOnRampFailureEvent = {
  type: CommerceFailureEventType.ONRAMP_FAILED;
  data: OnRampFailed;
}; // FIMXE: Error

export type CommerceSwapFailureEvent = {
  type: CommerceFailureEventType.SWAP_FAILED;
  data: SwapFailed;
}; // FIMXE: Error

export type CommerceSwapRejectedEvent = {
  type: CommerceFailureEventType.SWAP_REJECTED;
  data: SwapRejected;
}; // FIMXE: Error

export type CommerceSaleFailureEvent = {
  type: CommerceFailureEventType.SALE_FAILED;
  data: SaleFailed;
};

export type CommerceAddFundsFailureEvent = {
  type: CommerceFailureEventType.ADD_FUNDS_FAILED;
  data: AddFundsFailed;
};

export type CommerceFailureEvent =
  | CommerceAddFundsFailureEvent
  | CommerceBridgeFailureEvent
  | CommerceBridgeClaimWithdrawalFailedEvent
  | CommerceConnectFailureEvent
  | CommerceOnRampFailureEvent
  | CommerceSwapFailureEvent
  | CommerceSwapRejectedEvent
  | CommerceSaleFailureEvent;

export type CommercePaymentMethodSelectedEvent = {
  type: CommerceUserActionEventType.PAYMENT_METHOD_SELECTED;
  data: SalePaymentMethod;
};

export type CommercePaymentTokenSelectedEvent = {
  type: CommerceUserActionEventType.PAYMENT_TOKEN_SELECTED;
  data: SalePaymentToken;
};

export type CommerceNetworkSwitchEvent = {
  type: CommerceUserActionEventType.NETWORK_SWITCH;
  data: WalletNetworkSwitch;
};

export type CommerceUserActionEvent =
  | CommercePaymentMethodSelectedEvent
  | CommercePaymentTokenSelectedEvent
  | CommerceNetworkSwitchEvent;
