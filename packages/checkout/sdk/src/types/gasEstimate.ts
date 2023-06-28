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
 * A union type that represents either a GasEstimateBridgeToL2Params or a GasEstimateSwapParams.
 */
export type GasEstimateParams = GasEstimateBridgeToL2Params | GasEstimateSwapParams;

/**
 * An interface representing the parameters for estimating gas for a bridge to L2 transaction.
 * @param {GasEstimateType.BRIDGE_TO_L2} gasEstimateType - The type of gas estimate.
 * @param {boolean} isSpendingCapApprovalRequired - Whether or not spending cap approval is required.
 * @param {FungibleToken | undefined} tokenAddress - The address of the fungible token to use in the transaction.
 * @returns None
 */
export interface GasEstimateBridgeToL2Params {
  gasEstimateType: GasEstimateType.BRIDGE_TO_L2;
  isSpendingCapApprovalRequired: boolean;
  tokenAddress?: FungibleToken;
}

/**
 * An interface representing the parameters for a gas estimate swap.
 * @interface
 * @property {GasEstimateType.SWAP} gasEstimateType - The type of gas estimate, which is always "swap".
 */
export interface GasEstimateSwapParams {
  gasEstimateType: GasEstimateType.SWAP;
}

/**
 * An interface representing the result of a gas estimate for a swap transaction.
 * @interface GasEstimateSwapResult
 * @property {GasEstimateType.SWAP} gasEstimateType - The type of gas estimate, which is always "SWAP".
 * @property {TokenAmountEstimate} gasFee - The estimated gas fee for the swap transaction.
 */
export interface GasEstimateSwapResult {
  gasEstimateType: GasEstimateType.SWAP,
  gasFee: TokenAmountEstimate,
}

/**
 * An interface representing the result of a gas estimate for a bridge to L2 transaction.
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

/**
 * An interface representing an estimated token amount and the corresponding token information.
 * @interface TokenAmountEstimate
 * @property {BigNumber | undefined} estimatedAmount - The estimated amount of tokens.
 * @property {TokenInfo | undefined} token - The corresponding token information.
 */
export interface TokenAmountEstimate {
  estimatedAmount?: BigNumber;
  token?: TokenInfo;
}
