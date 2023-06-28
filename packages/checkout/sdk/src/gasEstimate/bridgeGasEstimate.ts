import { BigNumber } from 'ethers';
import { FeeData, Web3Provider } from '@ethersproject/providers';
import {
  BridgeFeeRequest,
  BridgeFeeResponse,
  FungibleToken,
  TokenBridge,
} from '@imtbl/bridge-sdk';
import { ChainId, TokenAmountEstimate } from '../types';

const GAS_LIMIT = 140000;

const doesChainSupportEIP1559 = (feeData: FeeData) => !!feeData.maxFeePerGas && !!feeData.maxPriorityFeePerGas;

const getGasPriceInWei = (feeData: FeeData): BigNumber | null => (doesChainSupportEIP1559(feeData)
  ? BigNumber.from(feeData.maxFeePerGas).add(
    BigNumber.from(feeData.maxPriorityFeePerGas),
  )
  : feeData.gasPrice && BigNumber.from(feeData.gasPrice));

const getGasEstimates = async (
  provider: Web3Provider,
): Promise<BigNumber | undefined> => {
  const txnGasLimitInWei = GAS_LIMIT; // todo: fetch gasLimit from bridgeSDK when they add new fn
  const feeData: FeeData = await provider.getFeeData();
  const gasPriceInWei = getGasPriceInWei(feeData);
  if (!gasPriceInWei) return undefined;
  return gasPriceInWei.mul(txnGasLimitInWei);
};

export async function getBridgeEstimatedGas(
  provider: Web3Provider,
  chainId: ChainId,
  isApproveTxnRequired: boolean,
): Promise<TokenAmountEstimate> {
  let estimatedAmount = await getGasEstimates(provider);
  if (!estimatedAmount) {
    return {
      estimatedAmount: undefined,
    };
  }

  if (isApproveTxnRequired) {
    estimatedAmount = estimatedAmount.add(estimatedAmount);
  }

  return {
    estimatedAmount,
  };
}

interface BridgeFeeEstimateResult {
  bridgeFee: TokenAmountEstimate;
  bridgeable: boolean;
}

export async function getBridgeFeeEstimate(
  tokenBridge: TokenBridge,
  tokenAddress: FungibleToken,
): Promise<BridgeFeeEstimateResult> {
  const bridgeFeeReq: BridgeFeeRequest = { token: tokenAddress };
  const bridgeFeeResponse: BridgeFeeResponse = await tokenBridge.getFee(
    bridgeFeeReq,
  );

  return {
    bridgeFee: {
      estimatedAmount: bridgeFeeResponse.feeAmount,
    },
    bridgeable: bridgeFeeResponse.bridgeable,
  };
}
