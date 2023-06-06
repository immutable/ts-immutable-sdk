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
  bridgeFee?: GasEstimateInfo;
  gasEstimate?: GasEstimateInfo;
  bridgeable?: boolean;
  fiatEstimate?: string;
}

export interface GasEstimateInfo {
  estimatedAmount?: BigNumber;
  token?: TokenInfo;
}
