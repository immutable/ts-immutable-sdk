import { Web3Provider } from '@ethersproject/providers';
import { CheckoutFlowType } from '../parameters/checkout';
import { ConnectionFailed } from './connect';
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
import { SwapFailed, SwapSuccess } from './swap';
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
  SALE_SUCCESS = 'SALE_SUCCESS',
  SALE_TRANSACTION_SUCCESS = 'SALE_TRANSACTION_SUCCESS',
  BRIDGE_SUCCESS = 'BRIDGE_SUCCESS',
  BRIDGE_CLAIM_WITHDRAWAL_SUCCESS = 'BRIDGE_CLAIM_WITHDRAWAL_SUCCESS',
}

export enum CheckoutFailureEventType {
  BRIDGE_FAILED = 'BRIDGE_FAILED',
  BRIDGE_CLAIM_WITHDRAWAL_FAILED = 'BRIDGE_CLAIM_WITHDRAWAL_FAILED',
}

export enum CheckoutUserActionEventType {
  PAYMENT_METHOD_SELECTED = 'PAYMENT_METHOD_SELECTED',
  PAYMENT_TOKEN_SELECTED = 'PAYMENT_TOKEN_SELECTED',
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
  flow: CheckoutFlowType.SALE;
  type: CheckoutSuccessEventType.SALE_SUCCESS;
  data: SaleSuccess;
};

export type CheckoutSaleSuccessfulTransactionEvent = {
  flow: CheckoutFlowType.SALE;
  type: CheckoutSuccessEventType.SALE_TRANSACTION_SUCCESS;
  data: SaleTransactionSuccess;
};

export type CheckoutOnRampSuccessEvent = {
  flow: CheckoutFlowType.ONRAMP;
  data: OnRampSuccess;
}; // FIMXE: TransactionSent

export type CheckoutBridgeSuccessEvent = {
  flow: CheckoutFlowType.BRIDGE;
  type: CheckoutSuccessEventType.BRIDGE_SUCCESS;
  data: BridgeTransactionSent;
}; // FIMXE: TransactionSent

export type CheckoutBridgeClaimWithdrawalSuccessEvent = {
  flow: CheckoutFlowType.BRIDGE;
  type: CheckoutSuccessEventType.BRIDGE_CLAIM_WITHDRAWAL_SUCCESS;
  data: BridgeClaimWithdrawalSuccess;
}; // FIMXE: TransactionSent

export type CheckoutSwapSuccessEvent = {
  flow: CheckoutFlowType.SWAP;
  data: SwapSuccess;
}; // FIMXE: TransactionSent

export type CheckoutSuccessEvent =
  | CheckoutBridgeSuccessEvent
  | CheckoutBridgeClaimWithdrawalSuccessEvent
  | CheckoutOnRampSuccessEvent
  | CheckoutSwapSuccessEvent
  | CheckoutSaleSuccessEvent
  | CheckoutSaleSuccessfulTransactionEvent;

export type CheckoutBridgeFailureEvent = {
  flow: CheckoutFlowType.BRIDGE;
  type: CheckoutFailureEventType.BRIDGE_FAILED;
  data: BridgeFailed;
}; // FIMXE: Error

export type CheckoutBridgeClaimWithdrawalFailedEvent = {
  flow: CheckoutFlowType.BRIDGE;
  type: CheckoutFailureEventType.BRIDGE_CLAIM_WITHDRAWAL_FAILED;
  data: BridgeClaimWithdrawalFailed;
}; // FIMXE: Error

export type CheckoutConnectFailureEvent = {
  flow: CheckoutFlowType.CONNECT;
  data: ConnectionFailed;
}; // FIMXE: Error

export type CheckoutOnRampFailureEvent = {
  flow: CheckoutFlowType.ONRAMP;
  data: OnRampFailed;
}; // FIMXE: Error

export type CheckoutSwapFailureEvent = {
  flow: CheckoutFlowType.SWAP;
  data: SwapFailed;
}; // FIMXE: Error

export type CheckoutSaleFailureEvent = {
  flow: CheckoutFlowType.SALE;
  data: SaleFailed;
};

export type CheckoutFailureEvent =
  | CheckoutBridgeFailureEvent
  | CheckoutBridgeClaimWithdrawalFailedEvent
  | CheckoutConnectFailureEvent
  | CheckoutOnRampFailureEvent
  | CheckoutSwapFailureEvent
  | CheckoutSaleFailureEvent;

export type CheckoutPaymentMethodSelectedEvent = {
  flow: CheckoutFlowType.SALE;
  type: CheckoutUserActionEventType.PAYMENT_METHOD_SELECTED;
  data: SalePaymentMethod;
};

export type CheckoutPaymentTokenSelectedEvent = {
  flow: CheckoutFlowType.SALE;
  type: CheckoutUserActionEventType.PAYMENT_TOKEN_SELECTED;
  data: SalePaymentToken;
};

export type CheckoutNetworkSwitchEvent = {
  flow: CheckoutFlowType.WALLET;
  data: WalletNetworkSwitch;
};

export type CheckoutUserActionEvent =
  | CheckoutPaymentMethodSelectedEvent
  | CheckoutPaymentTokenSelectedEvent
  | CheckoutNetworkSwitchEvent;
