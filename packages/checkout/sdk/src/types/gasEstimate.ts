import { BigNumber } from 'ethers';
import { BridgeFeeResponse } from '@imtbl/bridge-sdk';
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
 * @param {string|undefined} amount - The type of gas estimate.
 * @param {string|undefined} tokenAddress - The address of the token being bridged.
 * @param {string|undefined} senderAddress - The sender address for the bridge.
 * @param {string|undefined} recipientAddress - The receiver address for the bridge.
 * @dev having the amount, tokenAddress, senderAddress and recipientAddress able to be undefined prevents
 * causing a breaking change in the Checkout SDK. This functionality should be deprecated over time and
 * the Checkout SDK's 'estimateGas' method should force these currently optional params to be required.
*/
export interface GasEstimateBridgeToL2Params {
  gasEstimateType: GasEstimateType.BRIDGE_TO_L2;
  amount?: string,
  tokenAddress?: string,
  senderAddress?: string,
  recipientAddress?: string,
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
 * @property {TokenAmountEstimate} fees - The estimated gas fee for the swap transaction.
 */
export interface GasEstimateSwapResult {
  gasEstimateType: GasEstimateType.SWAP,
  fees: TokenAmountEstimate,
}

/**
 * An interface representing the result of a gas estimate for a bridge to L2 transaction {@link Checkout.gasEstimate}.
 * @interface GasEstimateBridgeToL2Result
 * @property {GasEstimateType.BRIDGE_TO_L2} gasEstimateType - The type of gas estimate.
 * @property {BridgeFeeResponse} fees - The estimated fees for the transaction.
 * @property {TokenInfo | undefined} token - The gas token information.
 */
export interface GasEstimateBridgeToL2Result {
  gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
  fees: BridgeFeeResponse;
  token?: TokenInfo;
}
/**
 * An interface representing the estimated fees.
 * @property {BigNumber | undefined} totalFees - The estimated fees for the transaction.
 * @property {TokenInfo | undefined} token - The gas token information.
 */

export interface TokenAmountEstimate {
  totalFees?: BigNumber;
  token?: TokenInfo;
}
