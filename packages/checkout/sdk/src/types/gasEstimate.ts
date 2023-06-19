import { BigNumber } from 'ethers';
import { FungibleToken } from '@imtbl/bridge-sdk';
import { TokenInfo } from './tokenInfo';

/**
 * * Enum representing the actions that gas can be estimated for when calling {@link Checkout.gasEstimate}.
 * */
export enum GasEstimateType {
  BRIDGE_TO_L2 = 'BRIDGE_TO_L2',
  SWAP = 'SWAP',
}

/**
 * * Type representing the params that can be used with {@link Checkout.gasEstimate}.
 * */
export type GasEstimateParams = GasEstimateBridgeToL2Params | GasEstimateSwapParams;

/**
 * * Interface representing the parameters to estimate gas for a bridge to L2 for {@link Checkout.gasEstimate}.
 @property {gasEstimateType} - The type of action to estimate gas for.
 @property {tokenAddress} - The address of the token to bridge.
 @property {boolean} isSpendingCapApprovalRequired - Is spending cap approval required.
 * */
export interface GasEstimateBridgeToL2Params {
  gasEstimateType: GasEstimateType.BRIDGE_TO_L2;
  isSpendingCapApprovalRequired: boolean;
  tokenAddress?: FungibleToken;
}

/**
 * * Interface representing the parameters to estimate gas for a swap for {@link Checkout.gasEstimate}.
 @property {gasEstimateType} - The type of action to estimate gas for.
 * */
export interface GasEstimateSwapParams {
  gasEstimateType: GasEstimateType.SWAP;
}

/**
 * * Interface representing the result for {@link Checkout.gasEstimate}.
 @property {gasEstimateType} - The type of action this gas estimate is for.
 @property {gasFee} - The gas fee estimate.
 * */
export interface GasEstimateSwapResult {
  gasEstimateType: GasEstimateType.SWAP,
  gasFee: TokenAmountEstimate,
}

/**
 * * Interface representing the result for {@link Checkout.gasEstimate}.
 @property {gasEstimateType} - The type of action this gas estimate is for.
 @property {gasFee} - The gas fee estimate.
 @property {bridgeFee} - The bridge fee estimate.
  @property {bridgeable} - Indicates whether the token can be bridged or not.
 * */
export interface GasEstimateBridgeToL2Result {
  gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
  gasFee: TokenAmountEstimate;
  bridgeFee: TokenAmountEstimate;
  bridgeable: boolean;
}

/**
 * * Interface representing the type used in the result for {@link Checkout.gasEstimate}.
 @property {BigNumber} estimatedAmount - estimated amount.
 @property {TokenInfo} token - token for the estimate.
 * */
export interface TokenAmountEstimate {
  estimatedAmount?: BigNumber;
  token?: TokenInfo;
}
