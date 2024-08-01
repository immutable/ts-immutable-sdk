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
} & SaleSuccess;

export type CheckoutSaleSuccessfulTransactionEvent = {
  flow: CheckoutFlowType.SALE;
} & SaleTransactionSuccess;

export type CheckoutOnRampSuccessEvent = {
  flow: CheckoutFlowType.ONRAMP;
} & OnRampSuccess; // FIMXE: TransactionSent

export type CheckoutBridgeSuccessEvent = {
  flow: CheckoutFlowType.BRIDGE;
} & BridgeTransactionSent; // FIMXE: TransactionSent

export type CheckoutBridgeClaimWithdrawalSuccessEvent = {
  flow: CheckoutFlowType.BRIDGE;
} & BridgeClaimWithdrawalSuccess; // FIMXE: TransactionSent

export type CheckoutSwapSuccessEvent = {
  flow: CheckoutFlowType.BRIDGE;
} & SwapSuccess; // FIMXE: TransactionSent

export type CheckoutSuccessEvent =
  | CheckoutBridgeSuccessEvent
  | CheckoutOnRampSuccessEvent
  | CheckoutSwapSuccessEvent
  | CheckoutSaleSuccessEvent
  | CheckoutSaleSuccessfulTransactionEvent;

export type CheckoutBridgeFailureEvent = {
  flow: CheckoutFlowType.BRIDGE;
} & BridgeFailed; // FIMXE: Error

export type CheckoutBridgeClaimWithdrawalFailedEvent = {
  flow: CheckoutFlowType.BRIDGE;
} & BridgeClaimWithdrawalFailed; // FIMXE: Error

export type CheckoutConnectFailureEvent = {
  flow: CheckoutFlowType.BRIDGE;
} & ConnectionFailed; // FIMXE: Error

export type CheckoutOnRampFailureEvent = {
  flow: CheckoutFlowType.BRIDGE;
} & OnRampFailed; // FIMXE: Error

export type CheckoutSwapFailureEvent = {
  flow: CheckoutFlowType.BRIDGE;
} & SwapFailed; // FIMXE: Error

export type CheckoutSaleFailureEvent = {
  flow: CheckoutFlowType.BRIDGE;
} & SaleFailed; // FIMXE: Error

export type CheckoutFailureEvent =
  | CheckoutBridgeFailureEvent
  | CheckoutConnectFailureEvent
  | CheckoutOnRampFailureEvent
  | CheckoutSwapFailureEvent
  | CheckoutSaleFailureEvent;

export type CheckoutPaymentMethodSelectedEvent = {
  flow: CheckoutFlowType.SALE;
} & SalePaymentMethod;

export type CheckoutPaymentTokenSelectedEvent = {
  flow: CheckoutFlowType.SALE;
} & SalePaymentToken;

export type CheckoutNetworkSwitchEvent = {
  flow: CheckoutFlowType.WALLET;
} & WalletNetworkSwitch;

export type CheckoutUserActionEvent =
  | CheckoutPaymentMethodSelectedEvent
  | CheckoutPaymentTokenSelectedEvent
  | CheckoutNetworkSwitchEvent;
