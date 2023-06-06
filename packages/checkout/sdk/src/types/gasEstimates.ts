import { TransactionRequest, Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { FungibleToken } from '@imtbl/bridge-sdk';
import { TokenInfo } from './tokenInfo';
import { ChainId } from './chainId';

export interface GetBridgeGasEstimateParams {
  tokenAddress: FungibleToken;
  transaction: TransactionRequest;
  provider: Web3Provider;
  approveTxn?: TransactionRequest;
  fromChainId: ChainId;
  toChainId: ChainId;
}

export interface GetBridgeGasEstimateResult {
  bridgeFee?: TokenAmountEstimate;
  gasEstimate?: TokenAmountEstimate;
  bridgeable?: boolean;
}

export interface TokenAmountEstimate {
  estimatedAmount?: BigNumber;
  token?: TokenInfo;
}
