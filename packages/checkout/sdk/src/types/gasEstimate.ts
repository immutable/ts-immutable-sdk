import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { FungibleToken } from '@imtbl/bridge-sdk';
import { Environment } from '@imtbl/config';
import { Exchange } from '@imtbl/dex-sdk';
import { TokenInfo } from './tokenInfo';

export type GasEstimate = BridgeToL2GasEstimate | SwapGasEstimate;

export interface BridgeToL2GasEstimate {
  type: GasEstimateType.BRIDGE_TO_L2;
  provider: Web3Provider,
  environment: Environment
}

export interface SwapGasEstimate {
  type: GasEstimateType.SWAP;
  exchange: Exchange,
  environment: Environment
}

export enum GasEstimateType {
  BRIDGE_TO_L2 = 'BRIDGE_TO_L2',
  SWAP = 'SWAP',
}

export interface GasEstimateParams {
  gasEstimate: GasEstimate;
}

export interface GasEstimateResult {
  estimatedAmount?: BigNumber;
  token?: TokenInfo;
}

/**
 * * Interface representing the parameters for {@link Checkout.getBridgeGasEstimate}.
 @property tokenAddress - Bridge token.
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
