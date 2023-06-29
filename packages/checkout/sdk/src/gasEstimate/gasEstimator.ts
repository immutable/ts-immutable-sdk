import { BigNumber, utils } from 'ethers/lib/ethers';
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { Contract, ethers } from 'ethers';
import { FungibleToken } from '@imtbl/bridge-sdk';
import { CheckoutError, CheckoutErrorType } from '../errors';
import {
  ChainId,
  ENVIRONMENT_L1_CHAIN_MAP,
  ENVIRONMENT_L2_CHAIN_MAP,
  ERC20ABI,
  GasEstimateBridgeToL2Result,
  GasEstimateParams,
  GasEstimateSwapResult,
  GasEstimateType,
  TokenInfo,
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

const DUMMY_WALLET_ADDRESS = '0x0000000000000000000000000000000000000000';
const DEFAULT_TOKEN_DECIMALS = 18;

async function getTokenInfoByAddress(
  config: CheckoutConfiguration,
  tokenAddress: FungibleToken,
  chainId: ChainId,
  provider: JsonRpcProvider,
): Promise<TokenInfo | undefined> {
  if (tokenAddress === 'NATIVE') {
    return config.networkMap.get(chainId)?.nativeCurrency;
  }

  const contract = new Contract(
    tokenAddress,
    JSON.stringify(ERC20ABI),
    provider,
  );
  const name = await contract.name();
  const symbol = await contract.symbol();
  const decimals = await contract.decimals();
  return {
    name,
    symbol,
    decimals,
    address: tokenAddress,
  };
}

async function bridgeToL2GasEstimator(
  readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>,
  config: CheckoutConfiguration,
  isSpendingCapApprovalRequired: boolean,
  tokenAddress?: FungibleToken,
): Promise<GasEstimateBridgeToL2Result> {
  const fromChainId = ENVIRONMENT_L1_CHAIN_MAP[config.environment];
  const toChainId = ENVIRONMENT_L2_CHAIN_MAP[config.environment];

  const gasEstimateTokensConfig = (await config.remoteConfigFetcher.getConfig(
    'gasEstimateTokens',
  )) as GasEstimateTokenConfig;

  const { gasTokenAddress, fromAddress } = gasEstimateTokensConfig[
    fromChainId
  ].bridgeToL2Addresses as GasEstimateBridgeToL2TokenConfig;

  const provider = readOnlyProviders.get(fromChainId);
  if (!provider) throw new Error(`Missing JsonRpcProvider for chain id: ${fromChainId}`);

  try {
    const gasFee = await getBridgeEstimatedGas(
      provider as Web3Provider,
      fromChainId,
      isSpendingCapApprovalRequired,
    );
    gasFee.token = await getTokenInfoByAddress(
      config,
      tokenAddress ?? (gasTokenAddress || 'NATIVE'),
      fromChainId,
      provider,
    );

    const tokenBridge = await instance.createBridgeInstance(
      fromChainId,
      toChainId,
      readOnlyProviders,
      config.environment,
    );

    const { bridgeFee, bridgeable } = await getBridgeFeeEstimate(
      tokenBridge,
      fromAddress,
    );
    bridgeFee.token = await getTokenInfoByAddress(
      config,
      fromAddress,
      toChainId,
      provider,
    );

    return {
      gasEstimateType: GasEstimateType.BRIDGE_TO_L2,
      gasFee,
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
  const chainId = ENVIRONMENT_L2_CHAIN_MAP[config.environment];

  const gasEstimateTokensConfig = (await config.remoteConfigFetcher.getConfig(
    'gasEstimateTokens',
  )) as GasEstimateTokenConfig;

  const { inAddress, outAddress } = gasEstimateTokensConfig[chainId]
    .swapAddresses as GasEstimateSwapTokenConfig;

  try {
    const exchange = await instance.createExchangeInstance(chainId, config);

    // Create a fake transaction to get the gas from the quote
    const { info } = await exchange.getUnsignedSwapTxFromAmountIn(
      DUMMY_WALLET_ADDRESS,
      inAddress,
      outAddress,
      BigNumber.from(utils.parseUnits('1', DEFAULT_TOKEN_DECIMALS)),
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
          decimals:
            info.gasFeeEstimate?.token.decimals ?? DEFAULT_TOKEN_DECIMALS,
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
