import { BigNumber, utils } from 'ethers/lib/ethers';
import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { ethers } from 'ethers';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { ChainId } from '../types';
import { getBridgeEstimatedGas, getBridgeFeeEstimate } from './bridgeGasEstimate';
import { GasEstimateBridgeToL2Result, GasEstimateSwapResult, GasEstimateType } from '../types/gasEstimate';
import * as instance from '../instance';

interface GasEstimateTokenAddresses {
  bridgeToL2Addresses: {
    gasTokenAddress: string;
    tokenToBridgeL2Address: string;
  };
  swapAddresses: {
    walletAddress: string;
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
        tokenToBridgeL2Address: 'NATIVE',
      },
      swapAddresses: {
        // Dummy swap transaction requires a valid address
        walletAddress: '',
        // todo: Replace with actual production addresses // todo: addresses causing gitleaks to fail
        tokenInAddress: '', // FUN
        tokenOutAddress: '', // DEX
      },
    },
  ],
  [
    Environment.SANDBOX, {
      bridgeToL2Addresses: {
        gasTokenAddress: 'NATIVE',
        // should be NATIVE (IMX) but bridge is not NATIVE supporting yet
        tokenToBridgeL2Address: '',
      },
      swapAddresses: {
        // Dummy swap transaction requires a valid address
        walletAddress: '',
        // todo: addresses causing gitleaks to fail
        tokenInAddress: '', // FUN
        tokenOutAddress: '', // DEX
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
  const { gasTokenAddress, tokenToBridgeL2Address } = bridgeToL2Addresses;

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
      tokenToBridgeL2Address,
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
  const { walletAddress, tokenInAddress, tokenOutAddress } = swapAddresses;

  // todo: Use the environment to set chainId and also use zkevm when this is ready for swap
  const chainId = ChainId.SEPOLIA;

  try {
    const exchange = await instance.createExchangeInstance(chainId, environment);

    // Create a fake transaction to get the gas from the quote
    const { info } = await exchange.getUnsignedSwapTxFromAmountIn(
      walletAddress,
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
