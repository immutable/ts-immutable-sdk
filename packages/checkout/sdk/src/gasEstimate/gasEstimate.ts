import { BigNumber } from 'ethers';
import { TransactionRequest, Web3Provider } from '@ethersproject/providers';
import {
  BridgeFeeRequest,
  BridgeFeeResponse,
  FungibleToken,
  TokenBridge,
} from '@imtbl/bridge-sdk';
import { GetBridgeGasEstimateResult } from '../types/gasEstimates';
import * as tokens from '../tokens';
import { ChainId, TokenFilterTypes } from '../types';

// L1 gas estimates
export async function getBridgeGasEstimate(
  transaction: TransactionRequest,
  provider: Web3Provider,
  approveTxn?: TransactionRequest,
): Promise<BigNumber> {
  // txn gas estimate
  const txnGasUnits = await provider.estimateGas(transaction);
  const maxFeePerGas = BigNumber.from(transaction.maxFeePerGas);
  const maxPriorityFeePerGas = BigNumber.from(transaction.maxPriorityFeePerGas);
  const gasCost = maxFeePerGas.add(maxPriorityFeePerGas).mul(txnGasUnits);

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
    return gasCost.add(approveGasCost);
  }

  // total gas estimate
  return gasCost;
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
  const tokenInfo = (
    await tokens.getTokenAllowList({
      type: TokenFilterTypes.ALL,
      chainId: destinationChainId,
    })
  ).tokens.find((token) => token.address === tokenAddress);

  return {
    bridgeFee: {
      estimatedAmount: bridgeFeeResponse.feeAmount,
      token: tokenInfo,
    },
    bridgeable: bridgeFeeResponse.bridgeable,
  };
}
