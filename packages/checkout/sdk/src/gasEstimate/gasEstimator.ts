import { BigNumber, utils } from 'ethers/lib/ethers';
import { Web3Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { FungibleToken } from '@imtbl/bridge-sdk';
import { CheckoutError, CheckoutErrorType } from '../errors';
import {
  ChainId,
  GasEstimateBridgeToL2Result,
  GasEstimateParams,
  GasEstimateSwapResult,
  GasEstimateType,
} from '../types';
import {
  getBridgeEstimatedGas,
  getBridgeFeeEstimate,
} from './bridgeGasEstimate';
import * as instance from '../instance';
import { CheckoutConfiguration } from '../config';
import {
  GasEstimateBridgeToL2TokenConfig,
  GasEstimateSwapTokenConfig,
  GasEstimateTokenConfig,
} from '../config/remoteConfigType';

// **************************************************** //
// This is duplicated in the widget-lib project.        //
// We are not exposing these functions given that this  //
// to keep the Checkout SDK interface as minimal as     //
// possible.                                            //
// **************************************************** //
const getL1ChainId = (config: CheckoutConfiguration): ChainId => {
  // DevMode and Sandbox will both use Sepolia.
  if (!config.isProduction) return ChainId.SEPOLIA;
  return ChainId.ETHEREUM;
};

const getL2ChainId = (config: CheckoutConfiguration): ChainId => {
  if (config.isDevelopment) return ChainId.IMTBL_ZKEVM_DEVNET;
  if (config.isProduction) return ChainId.IMTBL_ZKEVM_MAINNET;
  return ChainId.IMTBL_ZKEVM_TESTNET;
};
// **************************************************** //
// **************************************************** //

const DUMMY_WALLET_ADDRESS = '0x0000000000000000000000000000000000000000';
const DEFAULT_TOKEN_DECIMALS = 18;

async function bridgeToL2GasEstimator(
  readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>,
  config: CheckoutConfiguration,
  isSpendingCapApprovalRequired: boolean,
  tokenAddress?: FungibleToken,
): Promise<GasEstimateBridgeToL2Result> {
  const fromChainId = getL1ChainId(config);
  const toChainId = getL2ChainId(config);

  const gasEstimateTokensConfig = (await config.remote.get(
    'gasEstimateTokens',
  )) as GasEstimateTokenConfig;

  const { gasTokenAddress, fromAddress } = gasEstimateTokensConfig[
    fromChainId.toString()
  ].bridgeToL2Addresses as GasEstimateBridgeToL2TokenConfig;

  const provider = readOnlyProviders.get(fromChainId);

  try {
    const { estimatedAmount, token } = await getBridgeEstimatedGas(
      provider as Web3Provider,
      fromChainId,
      isSpendingCapApprovalRequired,
      tokenAddress ?? gasTokenAddress,
    );

    const tokenBridge = await instance.createBridgeInstance(
      fromChainId,
      toChainId,
      readOnlyProviders,
      config,
    );

    const { bridgeFee, bridgeable } = await getBridgeFeeEstimate(
      tokenBridge,
      fromAddress,
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
      bridgeable,
    };
  } catch {
    // In the case of an error, just return an empty gas & bridge fee estimate
    return {
      gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
      gasFee: {},
      bridgeFee: {},
      bridgeable: false,
    };
  }
}

async function swapGasEstimator(
  config: CheckoutConfiguration,
): Promise<GasEstimateSwapResult> {
  const chainId = getL2ChainId(config);

  const gasEstimateTokensConfig = (await config.remote.get(
    'gasEstimateTokens',
  )) as GasEstimateTokenConfig;

  const { inAddress, outAddress } = gasEstimateTokensConfig[chainId]
    .swapAddresses as GasEstimateSwapTokenConfig;

  try {
    const exchange = await instance.createExchangeInstance(chainId, config);

    // Create a fake transaction to get the gas from the quote
    const { swap } = await exchange.getUnsignedSwapTxFromAmountIn(
      DUMMY_WALLET_ADDRESS,
      inAddress,
      outAddress,
      BigNumber.from(utils.parseUnits('1', DEFAULT_TOKEN_DECIMALS)),
    );

    if (swap.gasFeeEstimate === null) {
      return {
        gasEstimateType: GasEstimateType.SWAP,
        gasFee: {},
      };
    }

    let estimatedAmount;
    if (swap.gasFeeEstimate.value) {
      estimatedAmount = BigNumber.from(swap.gasFeeEstimate.value);
    }

    return {
      gasEstimateType: GasEstimateType.SWAP,
      gasFee: {
        estimatedAmount,
        token: {
          address: swap.gasFeeEstimate?.token.address,
          symbol: swap.gasFeeEstimate?.token.symbol ?? '',
          name: swap.gasFeeEstimate?.token.name ?? '',
          decimals:
            swap.gasFeeEstimate?.token.decimals ?? DEFAULT_TOKEN_DECIMALS,
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

export async function gasEstimator(
  params: GasEstimateParams,
  readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>,
  config: CheckoutConfiguration,
): Promise<GasEstimateSwapResult | GasEstimateBridgeToL2Result> {
  switch (params.gasEstimateType) {
    case GasEstimateType.BRIDGE_TO_L2:
      return await bridgeToL2GasEstimator(
        readOnlyProviders,
        config,
        params.isSpendingCapApprovalRequired,
        params.tokenAddress,
      );
    case GasEstimateType.SWAP:
      return await swapGasEstimator(config);
    default:
      throw new CheckoutError(
        'Invalid type provided for gasEstimateType',
        CheckoutErrorType.INVALID_GAS_ESTIMATE_TYPE,
      );
  }
}
