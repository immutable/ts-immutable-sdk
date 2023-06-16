import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { FungibleToken } from '@imtbl/bridge-sdk';
import { TokenInfo } from './tokenInfo';

/**
 * * Enum representing the actions that gas can be estimated for using {@link Checkout.gasEstimate}.
 * */
export enum GasEstimateType {
  BRIDGE_TO_L2 = 'BRIDGE_TO_L2',
  SWAP = 'SWAP',
}

/**
 * * Interface representing the parameters for {@link Checkout.gasEstimate}.
 @property {gasEstimateType} - The type of action to estimate gas for.
 * */
export interface GasEstimateParams {
  gasEstimateType: GasEstimateType;
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
 * */
export interface GasEstimateBridgeToL2Result {
  gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
  gasFee: TokenAmountEstimate;
  bridgeFee: TokenAmountEstimate;
}

/**
 * * Interface representing the parameters for {@link Checkout.getBridgeGasEstimate}.
 @property {tokenAddress} - Bridge token.
 @property {Web3Provider} provider - Provider.
 @property {boolean} isSpendingCapApprovalRequired - Is spending cap approval required.
 * */
export interface GetBridgeGasEstimateParams {
  tokenAddress: FungibleToken;
  provider: Web3Provider;
  isSpendingCapApprovalRequired?: boolean;
}

/**
 * * Interface representing the parameters for {@link Checkout.getBridgeGasEstimate}.
 @property {TokenAmountEstimate} bridgeFee - Bridge fee.
 @property {TokenAmountEstimate} gasEstimate - Gas fee.
 @property {boolean} bridgeable - is bridge feasible.
 * */
export interface GetBridgeGasEstimateResult {
  bridgeFee?: TokenAmountEstimate;
  gasEstimate?: TokenAmountEstimate;
  bridgeable?: boolean;
}

/**
 * * Interface representing the parameters for {@link Checkout.getBridgeGasEstimate}.
 @property {BigNumber} estimatedAmount - estimated amount.
 @property {TokenInfo} token - token for the estimate.
 * */
export interface TokenAmountEstimate {
  estimatedAmount?: BigNumber;
  token?: TokenInfo;
}
