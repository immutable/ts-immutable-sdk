import {
  BigNumber,
  utils,
  ethers,
} from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { CheckoutError, CheckoutErrorType } from '../errors';
import {
  ChainId,
  GasEstimateBridgeToL2Result,
  GasEstimateBridgeToL2TokenConfig,
  GasEstimateParams,
  GasEstimateSwapResult,
  GasEstimateSwapTokenConfig,
  GasEstimateTokenConfig,
  GasEstimateType,
  TokenAmountEstimate,
} from '../types';
import {
  getBridgeEstimatedGas,
  getBridgeFeeEstimate,
} from './bridgeGasEstimate';
import * as instance from '../instance';
import { CheckoutConfiguration, getL1ChainId, getL2ChainId } from '../config';
import { BridgeFeeEstimateResult } from './bridgeGasEstimateType';

const DUMMY_WALLET_ADDRESS = '0x0000000000000000000000000000000000000001';
const DEFAULT_TOKEN_DECIMALS = 18;

async function bridgeToL2GasEstimator(
  readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>,
  config: CheckoutConfiguration,
  isSpendingCapApprovalRequired: boolean,
): Promise<GasEstimateBridgeToL2Result> {
  const fromChainId = getL1ChainId(config);
  const toChainId = getL2ChainId(config);

  const gasEstimateTokensConfig = (await config.remote.getConfig(
    'gasEstimateTokens',
  )) as GasEstimateTokenConfig;

  const { fromAddress } = gasEstimateTokensConfig[
    fromChainId
  ].bridgeToL2Addresses as GasEstimateBridgeToL2TokenConfig;

  const provider = readOnlyProviders.get(fromChainId);
  if (!provider) throw new Error(`Missing JsonRpcProvider for chain id: ${fromChainId}`);

  try {
    let gasFees: TokenAmountEstimate = {};
    const getGasFees = async () => {
      gasFees = await getBridgeEstimatedGas(
        provider as Web3Provider,
        isSpendingCapApprovalRequired,
      );
      gasFees.token = config.networkMap.get(fromChainId)?.nativeCurrency;
    };

    let bridgeFees: BridgeFeeEstimateResult = {
      bridgeFee: {},
      bridgeable: false,
    };
    const getBridgeFees = async () => {
      const tokenBridge = await instance.createBridgeInstance(
        fromChainId,
        toChainId,
        readOnlyProviders,
        config,
      );

      bridgeFees = await getBridgeFeeEstimate(
        tokenBridge,
        fromAddress,
      );
    };

    await Promise.all([
      getGasFees(),
      getBridgeFees(),
    ]);

    return {
      gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
      gasFee: gasFees,
      bridgeFee: {
        estimatedAmount: bridgeFees.bridgeFee?.estimatedAmount,
        token: bridgeFees.bridgeFee?.token,
      },
      bridgeable: bridgeFees.bridgeable,
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

  const gasEstimateTokensConfig = (await config.remote.getConfig(
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

    if (!swap.gasFeeEstimate) {
      return {
        gasEstimateType: GasEstimateType.SWAP,
        gasFee: {},
      };
    }

    return {
      gasEstimateType: GasEstimateType.SWAP,
      gasFee: {
        estimatedAmount: swap.gasFeeEstimate.value ? BigNumber.from(swap.gasFeeEstimate.value) : undefined,
        token: {
          address: swap.gasFeeEstimate.token.address,
          symbol: swap.gasFeeEstimate.token.symbol ?? '',
          name: swap.gasFeeEstimate.token.name ?? '',
          decimals:
            swap.gasFeeEstimate.token.decimals ?? DEFAULT_TOKEN_DECIMALS,
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
