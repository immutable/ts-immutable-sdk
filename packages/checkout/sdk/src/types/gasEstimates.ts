import { TransactionRequest, Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { FungibleToken } from '@imtbl/bridge-sdk';
import { TokenInfo } from './tokenInfo';
import { ChainId } from './chainId';

/**
 * * Interface representing the parameters for {@link Checkout.getBridgeGasEstimate}.
 @property tokenAddress - Bridge token.
 @property {TransactionRequest} transaction - Bridge transaction request.
 @property {Web3Provider} provider - Provider.
 @property {TransactionRequest} approveTxn - Approval transaction request.
 @property {ChainId} fromChainId - Chain id to bridge from.
 @property {ChainId} toChainId - Chain id to bridge to.
 * */
export interface GetBridgeGasEstimateParams {
  tokenAddress: FungibleToken;
  transaction: TransactionRequest;
  provider: Web3Provider;
  approveTxn?: TransactionRequest;
  fromChainId: ChainId;
  toChainId: ChainId;
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
