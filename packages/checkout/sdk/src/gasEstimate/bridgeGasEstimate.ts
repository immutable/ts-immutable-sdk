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

// L1 gas estimates
export async function getBridgeGasEstimate(
  transaction: TransactionRequest,
  provider: Web3Provider,
  chainId: ChainId,
  approveTxn?: TransactionRequest,
): Promise<TokenAmountEstimate> {
  // fetch token details
  const tokenInfo = await getTokenInfoByAddress('NATIVE', chainId);
  const result: TokenAmountEstimate = { token: tokenInfo };

  // txn gas estimate
  const txnGasUnits = await provider.estimateGas(transaction);
  const maxFeePerGas = BigNumber.from(transaction.maxFeePerGas);
  const maxPriorityFeePerGas = BigNumber.from(transaction.maxPriorityFeePerGas);
  const gasCost = maxFeePerGas.add(maxPriorityFeePerGas).mul(txnGasUnits);
  result.estimatedAmount = gasCost;

  // approveTxn gas estimate
  if (approveTxn) {
    const approveTxnGasUnits = await provider.estimateGas(approveTxn);
    const approveMaxFeePerGas = BigNumber.from(approveTxn.maxFeePerGas);
    const approveMaxPriorityFeePerGas = BigNumber.from(
      approveTxn.maxPriorityFeePerGas,
    );
    const approveGasCost = approveMaxFeePerGas
      .add(approveMaxPriorityFeePerGas)
      .mul(approveTxnGasUnits);
    result.estimatedAmount = gasCost.add(approveGasCost);
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
