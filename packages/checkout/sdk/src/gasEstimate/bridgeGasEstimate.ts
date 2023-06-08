import { BigNumber } from 'ethers';
import { TransactionRequest, Web3Provider } from '@ethersproject/providers';
import {
  BridgeFeeRequest,
  BridgeFeeResponse,
  FungibleToken,
  TokenBridge,
} from '@imtbl/bridge-sdk';
import {
  GetBridgeGasEstimateResult,
  TokenAmountEstimate,
} from '../types/gasEstimates';
import * as tokens from '../tokens';
import { ChainId, TokenFilterTypes, TokenInfo } from '../types';

async function getTokenInfoByAddress(
  tokenAddress: FungibleToken,
  chainId: ChainId,
): Promise<TokenInfo | undefined> {
  return (
    await tokens.getTokenAllowList({
      type: TokenFilterTypes.ALL,
      chainId,
    })
  ).tokens.find((token) => (token.address || 'NATIVE') === tokenAddress);
}

const doesChainSupportEIP1559 = (txn: TransactionRequest) => !!txn.maxFeePerGas && !!txn.maxPriorityFeePerGas;

const getGasPriceInWei = (txn: TransactionRequest) => (doesChainSupportEIP1559(txn)
  ? BigNumber.from(txn.maxFeePerGas).add(
    BigNumber.from(txn.maxPriorityFeePerGas),
  )
  : BigNumber.from(txn.gasPrice));

const getGasEstimates = async (
  provider: Web3Provider,
  txn: TransactionRequest,
) => {
  const txnGasUnits = await provider.estimateGas(txn);
  const gasPriceInWei = getGasPriceInWei(txn);
  return gasPriceInWei.mul(txnGasUnits);
};

export async function getBridgeEstimatedGas(
  transaction: TransactionRequest,
  provider: Web3Provider,
  chainId: ChainId,
  approveTxn?: TransactionRequest,
  tokenAddress?: FungibleToken,
): Promise<TokenAmountEstimate> {
  // fetch token details
  const tokenInfo = await getTokenInfoByAddress(
    tokenAddress || 'NATIVE',
    chainId,
  );
  const result: TokenAmountEstimate = { token: tokenInfo };

  // txn gas estimate
  result.estimatedAmount = await getGasEstimates(provider, transaction);

  // approveTxn gas estimate
  if (approveTxn) {
    const approveTxnGasEstimates = await getGasEstimates(provider, transaction);
    result.estimatedAmount = result.estimatedAmount.add(approveTxnGasEstimates);
  }

  return result;
}

// Bridge fees
export async function getBridgeFeeEstimate(
  tokenBridge: TokenBridge,
  tokenAddress: FungibleToken,
  destinationChainId: ChainId,
): Promise<GetBridgeGasEstimateResult> {
  const bridgeFeeReq: BridgeFeeRequest = { token: tokenAddress };
  const bridgeFeeResponse: BridgeFeeResponse = await tokenBridge.getFee(
    bridgeFeeReq,
  );
  const tokenInfo = await getTokenInfoByAddress(
    tokenAddress,
    destinationChainId,
  );

  return {
    bridgeFee: {
      estimatedAmount: bridgeFeeResponse.feeAmount,
      token: tokenInfo,
    },
    bridgeable: bridgeFeeResponse.bridgeable,
  };
}
