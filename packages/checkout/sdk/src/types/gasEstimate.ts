import { BigNumber } from 'ethers';
import { FungibleToken } from '@imtbl/bridge-sdk';
import { TokenInfo } from './tokenInfo';

/**
 * An enum representing the type of gas estimate.
 * @enum {string}
 * @property {string} BRIDGE_TO_L2 - The gas estimate type for a bridge to L2 transaction.
 * @property {string} SWAP - The gas estimate type for a swap transaction.
 */
export enum GasEstimateType {
  BRIDGE_TO_L2 = 'BRIDGE_TO_L2',
  SWAP = 'SWAP',
}

/**
 * Represents the parameters for estimating gas usage, which can be either
 * GasEstimateBridgeToL2Params or GasEstimateSwapParams {@link Checkout.gasEstimate}.
 * @typedef {GasEstimateBridgeToL2Params | GasEstimateSwapParams} GasEstimateParams
 */
export type GasEstimateParams = GasEstimateBridgeToL2Params | GasEstimateSwapParams;

/**
 * An interface representing the parameters for estimating gas for a bridge to L2 transaction {@link Checkout.gasEstimate}.
 * @param {GasEstimateType.BRIDGE_TO_L2} gasEstimateType - The type of gas estimate.
 * @param {boolean} isSpendingCapApprovalRequired - Whether or not spending cap approval is required.
 * @param {FungibleToken | undefined} tokenAddress - The address of the fungible token to use in the transaction.
 */
export interface GasEstimateBridgeToL2Params {
  gasEstimateType: GasEstimateType.BRIDGE_TO_L2;
  isSpendingCapApprovalRequired: boolean;
  tokenAddress?: FungibleToken;
}

/**
 * An interface representing the parameters for a gas estimate swap {@link Checkout.gasEstimate}.
 * @interface
 * @property {GasEstimateType.SWAP} gasEstimateType - The type of gas estimate, which is always "swap".
 */
export interface GasEstimateSwapParams {
  gasEstimateType: GasEstimateType.SWAP;
}

/**
 * An interface representing the result of a gas estimate for a swap transaction {@link Checkout.gasEstimate}.
 * @interface GasEstimateSwapResult
 * @property {GasEstimateType.SWAP} gasEstimateType - The type of gas estimate, which is always "SWAP".
 * @property {TokenAmountEstimate} gasFee - The estimated gas fee for the swap transaction.
 */
export interface GasEstimateSwapResult {
  gasEstimateType: GasEstimateType.SWAP,
  gasFee: TokenAmountEstimate,
}

/**
 * An interface representing the result of a gas estimate for a bridge to L2 transaction {@link Checkout.gasEstimate}.
 * @interface GasEstimateBridgeToL2Result
 * @property {GasEstimateType.BRIDGE_TO_L2} gasEstimateType - The type of gas estimate.
 * @property {TokenAmountEstimate} gasFee - The estimated gas fee for the transaction.
 * @property {TokenAmountEstimate} bridgeFee - The estimated bridge fee for the transaction.
 * @property {boolean} bridgeable - A boolean indicating whether the transaction is bridgeable.
 */
export interface GasEstimateBridgeToL2Result {
  gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
  gasFee: TokenAmountEstimate;
  bridgeFee: TokenAmountEstimate;
  bridgeable: boolean;
}

export interface TokenAmountEstimate {
  estimatedAmount?: BigNumber;
  token?: TokenInfo;
}
