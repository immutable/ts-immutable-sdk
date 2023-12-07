import { BigNumber } from 'ethers';
import { FeeData, Web3Provider } from '@ethersproject/providers';
import {
  FungibleToken,
  TokenBridge,
} from '@imtbl/bridge-sdk';
import {
  TokenAmountEstimate,
} from '../types/gasEstimate';
import { BridgeFeeEstimateResult } from './bridgeGasEstimateType';
import { getGasPriceInWei } from './gasPriceInWei';

const GAS_LIMIT = 140000;

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
  withApproval: boolean,
): Promise<TokenAmountEstimate> {
  const estimatedAmount = await getGasEstimates(provider);

  // Return an undefined value for estimatedAmount
  if (!estimatedAmount) return { estimatedAmount };

  if (!withApproval) return { estimatedAmount };

  return { estimatedAmount: estimatedAmount.add(estimatedAmount) };
}

export async function getBridgeFeeEstimate(
  tokenBridge: TokenBridge,
  tokenAddress: FungibleToken,
): Promise<BridgeFeeEstimateResult> {
  const bridgeFeeResponse = await tokenBridge.getFee({ token: tokenAddress });

  return {
    bridgeFee: { estimatedAmount: bridgeFeeResponse.feeAmount },
    bridgeable: bridgeFeeResponse.bridgeable,
  };
}
