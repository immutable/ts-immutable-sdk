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
import { ChainId } from '../types';
import { CheckoutConfiguration } from '../config';

const GAS_LIMIT = 140000;

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  gasTokenAddress?: FungibleToken,
): Promise<TokenAmountEstimate> {
  const token = config.networkMap.get(chainId)?.nativeCurrency;

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

  const tokenInfo = config.networkMap.get(destinationChainId)?.nativeCurrency;

  return {
    bridgeFee: {
      estimatedAmount: bridgeFeeResponse.feeAmount,
      token: tokenInfo,
    },
    bridgeable: bridgeFeeResponse.bridgeable,
  };
}
