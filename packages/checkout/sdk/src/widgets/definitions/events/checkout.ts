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

export enum CheckoutEventType {
  INITIALISED = 'INITIALISED',
  PROVIDER_UPDATED = 'PROVIDER_UPDATED',
  CLOSE = 'CLOSE',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  DISCONNECTED = 'DISCONNECTED',
  USER_ACTION = 'USER_ACTION',
}

export enum CheckoutSuccessEventType {
  SWAP_SUCCESS = 'SWAP_SUCCESS',
  ONRAMP_SUCCESS = 'ONRAMP_SUCCESS',
  CONNECT_SUCCESS = 'CONNECT_SUCCESS',
  SALE_SUCCESS = 'SALE_SUCCESS',
  SALE_TRANSACTION_SUCCESS = 'SALE_TRANSACTION_SUCCESS',
  BRIDGE_SUCCESS = 'BRIDGE_SUCCESS',
  BRIDGE_CLAIM_WITHDRAWAL_SUCCESS = 'BRIDGE_CLAIM_WITHDRAWAL_SUCCESS',
}

export enum CheckoutFailureEventType {
  BRIDGE_FAILED = 'BRIDGE_FAILED',
  BRIDGE_CLAIM_WITHDRAWAL_FAILED = 'BRIDGE_CLAIM_WITHDRAWAL_FAILED',
  SWAP_FAILED = 'SWAP_FAILED',
  SWAP_REJECTED = 'SWAP_REJECTED',
  CONNECT_FAILED = 'CONNECT_FAILED',
  SALE_FAILED = 'SALE_FAILED',
  ONRAMP_FAILED = 'ONRAMP_FAILED',
}

export enum CheckoutUserActionEventType {
  PAYMENT_METHOD_SELECTED = 'PAYMENT_METHOD_SELECTED',
  PAYMENT_TOKEN_SELECTED = 'PAYMENT_TOKEN_SELECTED',
  NETWORK_SWITCH = 'NETWORK_SWITCH',
}

export type CheckoutProviderUpdatedEvent = {
  /** The connected provider. */
  provider: Web3Provider;
  /** The wallet provider name of the connected provider. */
  walletProviderName: WalletProviderName | undefined;
  /** The wallet provider EIP-6963 metadata. */
  walletProviderInfo: EIP6963ProviderInfo | undefined;
};

export type CheckoutSaleSuccessEvent = {
  type: CheckoutSuccessEventType.SALE_SUCCESS;
  data: SaleSuccess;
};

export type CheckoutSaleSuccessfulTransactionEvent = {
  type: CheckoutSuccessEventType.SALE_TRANSACTION_SUCCESS;
  data: SaleTransactionSuccess;
};

export type CheckoutOnRampSuccessEvent = {
  type: CheckoutSuccessEventType.ONRAMP_SUCCESS;
  data: OnRampSuccess;
}; // FIMXE: TransactionSent

export type CheckoutBridgeSuccessEvent = {
  type: CheckoutSuccessEventType.BRIDGE_SUCCESS;
  data: BridgeTransactionSent;
}; // FIMXE: TransactionSent

export type CheckoutBridgeClaimWithdrawalSuccessEvent = {
  type: CheckoutSuccessEventType.BRIDGE_CLAIM_WITHDRAWAL_SUCCESS;
  data: BridgeClaimWithdrawalSuccess;
}; // FIMXE: TransactionSent

export type CheckoutSwapSuccessEvent = {
  type: CheckoutSuccessEventType.SWAP_SUCCESS;
  data: SwapSuccess;
}; // FIMXE: TransactionSent

export type CheckoutConnectSuccessEvent = {
  type: CheckoutSuccessEventType.CONNECT_SUCCESS;
  data: ConnectionSuccess;
};

export type CheckoutSuccessEvent =
  | CheckoutConnectSuccessEvent
  | CheckoutBridgeSuccessEvent
  | CheckoutBridgeClaimWithdrawalSuccessEvent
  | CheckoutOnRampSuccessEvent
  | CheckoutSwapSuccessEvent
  | CheckoutSaleSuccessEvent
  | CheckoutSaleSuccessfulTransactionEvent;

export type CheckoutBridgeFailureEvent = {
  type: CheckoutFailureEventType.BRIDGE_FAILED;
  data: BridgeFailed;
}; // FIMXE: Error

export type CheckoutBridgeClaimWithdrawalFailedEvent = {
  type: CheckoutFailureEventType.BRIDGE_CLAIM_WITHDRAWAL_FAILED;
  data: BridgeClaimWithdrawalFailed;
}; // FIMXE: Error

export type CheckoutConnectFailureEvent = {
  type: CheckoutFailureEventType.CONNECT_FAILED;
  data: ConnectionFailed;
}; // FIMXE: Error

export type CheckoutOnRampFailureEvent = {
  type: CheckoutFailureEventType.ONRAMP_FAILED;
  data: OnRampFailed;
}; // FIMXE: Error

export type CheckoutSwapFailureEvent = {
  type: CheckoutFailureEventType.SWAP_FAILED;
  data: SwapFailed;
}; // FIMXE: Error

export type CheckoutSwapRejectedEvent = {
  type: CheckoutFailureEventType.SWAP_REJECTED;
  data: SwapRejected;
}; // FIMXE: Error

export type CheckoutSaleFailureEvent = {
  type: CheckoutFailureEventType.SALE_FAILED;
  data: SaleFailed;
};

export type CheckoutFailureEvent =
  | CheckoutBridgeFailureEvent
  | CheckoutBridgeClaimWithdrawalFailedEvent
  | CheckoutConnectFailureEvent
  | CheckoutOnRampFailureEvent
  | CheckoutSwapFailureEvent
  | CheckoutSwapRejectedEvent
  | CheckoutSaleFailureEvent;

export type CheckoutPaymentMethodSelectedEvent = {
  type: CheckoutUserActionEventType.PAYMENT_METHOD_SELECTED;
  data: SalePaymentMethod;
};

export type CheckoutPaymentTokenSelectedEvent = {
  type: CheckoutUserActionEventType.PAYMENT_TOKEN_SELECTED;
  data: SalePaymentToken;
};

export type CheckoutNetworkSwitchEvent = {
  type: CheckoutUserActionEventType.NETWORK_SWITCH;
  data: WalletNetworkSwitch;
};

export type CheckoutUserActionEvent =
  | CheckoutPaymentMethodSelectedEvent
  | CheckoutPaymentTokenSelectedEvent
  | CheckoutNetworkSwitchEvent;
