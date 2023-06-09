import { BigNumber } from 'ethers';
import {
  FeeData,
  TransactionRequest,
  Web3Provider,
} from '@ethersproject/providers';
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

const doesChainSupportEIP1559 = (feeData: FeeData) => !!feeData.maxFeePerGas && !!feeData.maxPriorityFeePerGas;

const getGasPriceInWei = (feeData: FeeData) => (doesChainSupportEIP1559(feeData)
  ? BigNumber.from(feeData.maxFeePerGas).add(
    BigNumber.from(feeData.maxPriorityFeePerGas),
  )
  : BigNumber.from(feeData.gasPrice));

const getGasEstimates = async (provider: Web3Provider) => {
  const txnGasLimitInWei = 140000; // todo: fetch gasLimit from bridgeSDK when they add new fn
  const feeData: FeeData = await provider.getFeeData();

  const gasPriceInWei = getGasPriceInWei(feeData);
  return gasPriceInWei.mul(txnGasLimitInWei);
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

  const gasEstimate = await getGasEstimates(provider);
  result.estimatedAmount = gasEstimate;

  if (approveTxn) {
    result.estimatedAmount.add(gasEstimate);
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
