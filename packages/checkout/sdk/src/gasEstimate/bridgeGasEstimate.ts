import { BigNumber } from 'ethers';
import { FeeData, Web3Provider } from '@ethersproject/providers';
import {
  BridgeFeeRequest,
  BridgeFeeResponse,
  FungibleToken,
  TokenBridge,
} from '@imtbl/bridge-sdk';
import {
  TokenAmountEstimate,
} from '../types/gasEstimate';
import * as tokens from '../tokens';
import { ChainId, TokenFilterTypes, TokenInfo } from '../types';
import { CheckoutConfiguration } from '../config';

const GAS_LIMIT = 140000;

async function getTokenInfoByAddress(
  config: CheckoutConfiguration,
  tokenAddress: FungibleToken,
  chainId: ChainId,
): Promise<TokenInfo | undefined> {
  return (
    await tokens.getTokenAllowList(config, {
      type: TokenFilterTypes.ALL,
      chainId,
    })
  ).tokens.find((token) => (token.address || 'NATIVE') === tokenAddress);
}

const doesChainSupportEIP1559 = (feeData: FeeData) => !!feeData.maxFeePerGas && !!feeData.maxPriorityFeePerGas;

const getGasPriceInWei = (feeData: FeeData): BigNumber | null => (doesChainSupportEIP1559(feeData)
  ? BigNumber.from(feeData.maxFeePerGas).add(
    BigNumber.from(feeData.maxPriorityFeePerGas),
  )
  : feeData.gasPrice && BigNumber.from(feeData.gasPrice));

const getGasEstimates = async (provider: Web3Provider): Promise<BigNumber | undefined> => {
  const txnGasLimitInWei = GAS_LIMIT; // todo: fetch gasLimit from bridgeSDK when they add new fn
  const feeData: FeeData = await provider.getFeeData();
  const gasPriceInWei = getGasPriceInWei(feeData);
  if (!gasPriceInWei) return undefined;
  return gasPriceInWei.mul(txnGasLimitInWei);
};

export async function getBridgeEstimatedGas(
  config: CheckoutConfiguration,
  provider: Web3Provider,
  chainId: ChainId,
  isApproveTxnRequired: boolean,
  gasTokenAddress?: FungibleToken,
): Promise<TokenAmountEstimate> {
  const token = await getTokenInfoByAddress(
    config,
    gasTokenAddress || 'NATIVE',
    chainId,
  );

  let estimatedAmount = await getGasEstimates(provider);
  if (!estimatedAmount) {
    return {
      estimatedAmount: undefined,
      token,
    };
  }

  if (isApproveTxnRequired) {
    estimatedAmount = estimatedAmount.add(estimatedAmount);
  }

  const result: TokenAmountEstimate = {
    estimatedAmount,
    token,
  };

  return result;
}

interface BridgeFeeEstimateResult {
  bridgeFee: TokenAmountEstimate,
  bridgeable: boolean
}

export async function getBridgeFeeEstimate(
  config: CheckoutConfiguration,
  tokenBridge: TokenBridge,
  tokenAddress: FungibleToken,
  destinationChainId: ChainId,
): Promise<BridgeFeeEstimateResult> {
  const bridgeFeeReq: BridgeFeeRequest = { token: tokenAddress };
  const bridgeFeeResponse: BridgeFeeResponse = await tokenBridge.getFee(
    bridgeFeeReq,
  );

  const tokenInfo = await getTokenInfoByAddress(
    config,
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
