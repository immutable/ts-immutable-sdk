import { BigNumber, utils } from 'ethers/lib/ethers';
import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { Exchange } from '@imtbl/dex-sdk';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { ChainId } from '../types';
import { getBridgeEstimatedGas } from './bridgeGasEstimate';
import { GasEstimate, GasEstimateResult, GasEstimateType } from '../types/gasEstimate';

const gasFeeEstimateAddresses = new Map<Environment, any>([
  [
    Environment.PRODUCTION, {
      bridgeToL2Address: '', // todo: switch to NATIVE string
      swap: {
        // todo: Replace with actual production addresses
        fromAddress: '0x741185AEFC3E539c1F42c1d6eeE8bFf1c89D70FE', // FUN
        toAddress: '0xaC953a0d7B67Fae17c87abf79f09D0f818AC66A2', // DEX
      },
    },
  ],
  [
    Environment.SANDBOX, {
      bridgeL2Address: '', // todo: switch to NATIVE string
      swap: {
        fromAddress: '0x741185AEFC3E539c1F42c1d6eeE8bFf1c89D70FE', // FUN
        toAddress: '0xaC953a0d7B67Fae17c87abf79f09D0f818AC66A2', // DEX
      },
    },
  ],
]);

async function bridgeL2GasEstimator(provider: Web3Provider, environment: Environment): Promise<GasEstimateResult> {
  const chainId = environment === Environment.PRODUCTION ? ChainId.ETHEREUM : ChainId.SEPOLIA;
  const gasFeeEstimateAddress = gasFeeEstimateAddresses.get(environment).bridgeL2Address;

  const {
    estimatedAmount,
    token,
  } = await getBridgeEstimatedGas(
    provider,
    chainId,
    false, // todo: should we use true for approve txn?
    gasFeeEstimateAddress,
  );

  return {
    estimatedAmount,
    token,
  };
}

async function swapGasEstimator(exchange: Exchange, environment: Environment): Promise<GasEstimateResult> {
  const { fromAddress, toAddress } = gasFeeEstimateAddresses.get(environment).swap;

  // Create a fake transaction to get the gas from the quote
  const { info } = await exchange.getUnsignedSwapTxFromAmountIn(
    '0x000',
    fromAddress,
    toAddress,
    BigNumber.from(utils.parseUnits('1', 18)),
  );

  return {
    estimatedAmount: BigNumber.from(info.gasFeeEstimate?.amount),
    token: {
      address: info.gasFeeEstimate?.token.address,
      symbol: info.gasFeeEstimate?.token.symbol ?? '',
      name: info.gasFeeEstimate?.token.name ?? '',
      decimals: info.gasFeeEstimate?.token.decimals ?? 18,
    },
  };
}

export async function gasServiceEstimator(gasEstimate: GasEstimate): Promise<GasEstimateResult> {
  switch (gasEstimate.type) {
    case GasEstimateType.BRIDGE_TO_L2:
      return await bridgeL2GasEstimator(gasEstimate.provider, gasEstimate.environment);
    case GasEstimateType.SWAP:
      return await swapGasEstimator(gasEstimate.exchange, gasEstimate.environment);
    default:
      throw new CheckoutError(
        'Invalid type provided for gasEstimateType',
        CheckoutErrorType.INVALID_GAS_ESTIMATE_TYPE,
      );
  }
}
