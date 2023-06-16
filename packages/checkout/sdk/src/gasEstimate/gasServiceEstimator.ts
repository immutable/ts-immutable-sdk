import { BigNumber, utils } from 'ethers/lib/ethers';
import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { ethers } from 'ethers';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { ChainId } from '../types';
import { getBridgeEstimatedGas, getBridgeFeeEstimate } from './bridgeGasEstimate';
import { GasEstimateBridgeToL2Result, GasEstimateSwapResult, GasEstimateType } from '../types/gasEstimate';
import * as instance from '../instance';

const DUMMY_WALLET_ADDRESS = '0x0000000000000000000000000000000000000000';

interface GasEstimateTokenAddresses {
  bridgeToL2Addresses: {
    gasTokenAddress: string;
    tokenToBridgeAddress: string;
  };
  swapAddresses: {
    fromAddress: string;
    tokenInAddress: string;
    tokenOutAddress: string;
  };
}

// Token addresses used for creating dummy requests to estimate gas fees
const gasFeeEstimateAddresses = new Map<Environment, GasEstimateTokenAddresses>([
  [
    Environment.PRODUCTION, {
      bridgeToL2Addresses: {
        gasTokenAddress: 'NATIVE',
        // todo: Add production address
        tokenToBridgeAddress: '',
      },
      swapAddresses: {
        fromAddress: DUMMY_WALLET_ADDRESS,
        // todo: Add production addresses
        tokenInAddress: '',
        tokenOutAddress: '',
      },
    },
  ],
  [
    Environment.SANDBOX, {
      bridgeToL2Addresses: {
        gasTokenAddress: 'NATIVE',
        tokenToBridgeAddress: '0xd1da7e9b2Ce1a4024DaD52b3D37F4c5c91a525C1', // IMX
      },
      swapAddresses: {
        fromAddress: DUMMY_WALLET_ADDRESS,
        tokenInAddress: '0x741185AEFC3E539c1F42c1d6eeE8bFf1c89D70FE', // FUN
        tokenOutAddress: '0xaC953a0d7B67Fae17c87abf79f09D0f818AC66A2', // DEX
      },
    },
  ],
]);

async function bridgeToL2GasEstimator(
  readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>,
  environment: Environment,
): Promise<GasEstimateBridgeToL2Result> {
  const fromChainId = environment === Environment.PRODUCTION ? ChainId.ETHEREUM : ChainId.SEPOLIA;
  const toChainId = environment === Environment.PRODUCTION ? ChainId.IMTBL_ZKEVM_TESTNET : ChainId.IMTBL_ZKEVM_DEVNET;

  const { bridgeToL2Addresses } = gasFeeEstimateAddresses.get(environment)!;
  const { gasTokenAddress, tokenToBridgeAddress } = bridgeToL2Addresses;

  const provider = environment === Environment.PRODUCTION
    ? readOnlyProviders.get(ChainId.ETHEREUM)
    : readOnlyProviders.get(ChainId.SEPOLIA);

  try {
    const {
      estimatedAmount,
      token,
    } = await getBridgeEstimatedGas(
      provider as Web3Provider,
      fromChainId,
      true,
      gasTokenAddress,
    );

    const tokenBridge = await instance.createBridgeInstance(
      fromChainId,
      toChainId,
      readOnlyProviders,
      environment,
    );

    const { bridgeFee } = await getBridgeFeeEstimate(
      tokenBridge,
      tokenToBridgeAddress,
      toChainId,
    );

    return {
      gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
      gasFee: {
        estimatedAmount,
        token,
      },
      bridgeFee: {
        estimatedAmount: bridgeFee?.estimatedAmount,
        token: bridgeFee?.token,
      },
    };
  } catch {
    // In the case of an error, just return an empty gas & bridge fee estimate
    return {
      gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
      gasFee: {},
      bridgeFee: {},
    };
  }
}

async function swapGasEstimator(
  environment: Environment,
): Promise<GasEstimateSwapResult> {
  const { swapAddresses } = gasFeeEstimateAddresses.get(environment)!;
  const { fromAddress, tokenInAddress, tokenOutAddress } = swapAddresses;

  // todo: Use the environment to set chainId and also use zkevm when this is ready for swap
  const chainId = ChainId.SEPOLIA;

  try {
    const exchange = await instance.createExchangeInstance(chainId, environment);

    // Create a fake transaction to get the gas from the quote
    const { info } = await exchange.getUnsignedSwapTxFromAmountIn(
      fromAddress,
      tokenInAddress,
      tokenOutAddress,
      BigNumber.from(utils.parseUnits('1', 18)),
    );

    if (info.gasFeeEstimate === null) {
      return {
        gasEstimateType: GasEstimateType.SWAP,
        gasFee: {},
      };
    }

    let estimatedAmount;
    if (info.gasFeeEstimate.amount) {
      estimatedAmount = BigNumber.from(info.gasFeeEstimate.amount);
    }

    return {
      gasEstimateType: GasEstimateType.SWAP,
      gasFee: {
        estimatedAmount,
        token: {
          address: info.gasFeeEstimate?.token.address,
          symbol: info.gasFeeEstimate?.token.symbol ?? '',
          name: info.gasFeeEstimate?.token.name ?? '',
          decimals: info.gasFeeEstimate?.token.decimals ?? 18,
        },
      },
    };
  } catch {
    // In the case of an error, just return an empty gas fee estimate
    return {
      gasEstimateType: GasEstimateType.SWAP,
      gasFee: {},
    };
  }
}

export async function gasServiceEstimator(
  type: GasEstimateType,
  readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>,
  environment: Environment,
): Promise<GasEstimateSwapResult | GasEstimateBridgeToL2Result> {
  switch (type) {
    case GasEstimateType.BRIDGE_TO_L2:
      return await bridgeToL2GasEstimator(readOnlyProviders, environment);
    case GasEstimateType.SWAP:
      return await swapGasEstimator(environment);
    default:
      throw new CheckoutError(
        'Invalid type provided for gasEstimateType',
        CheckoutErrorType.INVALID_GAS_ESTIMATE_TYPE,
      );
  }
}
