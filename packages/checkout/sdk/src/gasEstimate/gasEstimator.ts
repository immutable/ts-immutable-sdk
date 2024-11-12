import { JsonRpcProvider, parseUnits } from 'ethers';
import { CheckoutError, CheckoutErrorType } from '../errors';
import {
  ChainId,
  GasEstimateBridgeToL2Result,
  GasEstimateParams,
  GasEstimateSwapResult,
  GasEstimateSwapTokenConfig,
  GasEstimateTokenConfig,
  GasEstimateType,
} from '../types';
import {
  getBridgeFeeEstimate,
} from './bridgeGasEstimate';
import * as instance from '../instance';
import { CheckoutConfiguration, getL1ChainId, getL2ChainId } from '../config';

const DUMMY_WALLET_ADDRESS = '0x0000000000000000000000000000000000000001';
const DEFAULT_TOKEN_DECIMALS = 18;

async function bridgeToL2GasEstimator(
  readOnlyProviders: Map<ChainId, JsonRpcProvider>,
  config: CheckoutConfiguration,
): Promise<GasEstimateBridgeToL2Result> {
  const fromChainId = getL1ChainId(config);
  const toChainId = getL2ChainId(config);

  const provider = readOnlyProviders.get(fromChainId);
  if (!provider) throw new Error(`Missing JsonRpcProvider for chain id: ${fromChainId}`);

  try {
    const tokenBridge = instance.createBridgeInstance(
      fromChainId,
      toChainId,
      readOnlyProviders,
      config,
    );

    // This gas estimate does not include an ERC20 approval
    const fees = await getBridgeFeeEstimate(
      tokenBridge,
      fromChainId,
      toChainId,
      config,
    );

    return {
      gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
      fees,
      token: config.networkMap.get(fromChainId)?.nativeCurrency,
    };
  } catch {
    // In the case of an error, just return default fee estimate
    return {
      gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
      fees: {
        sourceChainGas: BigInt(0),
        approvalFee: BigInt(0),
        bridgeFee: BigInt(0),
        imtblFee: BigInt(0),
        totalFees: BigInt(0),
      },
      token: config.networkMap.get(fromChainId)?.nativeCurrency,
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
      BigInt(parseUnits('1', DEFAULT_TOKEN_DECIMALS)),
    );

    if (!swap.gasFeeEstimate) {
      return {
        gasEstimateType: GasEstimateType.SWAP,
        fees: {},
      };
    }

    return {
      gasEstimateType: GasEstimateType.SWAP,
      fees: {
        totalFees: swap.gasFeeEstimate.value ? BigInt(swap.gasFeeEstimate.value) : undefined,
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
      fees: {},
    };
  }
}

export async function gasEstimator(
  params: GasEstimateParams,
  readOnlyProviders: Map<ChainId, JsonRpcProvider>,
  config: CheckoutConfiguration,
): Promise<GasEstimateSwapResult | GasEstimateBridgeToL2Result> {
  switch (params.gasEstimateType) {
    case GasEstimateType.BRIDGE_TO_L2:
      return await bridgeToL2GasEstimator(
        readOnlyProviders,
        config,
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
