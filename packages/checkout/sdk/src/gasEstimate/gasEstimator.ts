import { BigNumber, utils } from 'ethers/lib/ethers';
import { Web3Provider } from '@ethersproject/providers';
import { Environment } from '@imtbl/config';
import { ethers } from 'ethers';
import { FungibleToken } from '@imtbl/bridge-sdk';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { ChainId } from '../types';
import { getBridgeEstimatedGas, getBridgeFeeEstimate } from './bridgeGasEstimate';
import {
  GasEstimateBridgeToL2Result,
  GasEstimateParams,
  GasEstimateSwapResult,
  GasEstimateType,
} from '../types/gasEstimate';
import * as instance from '../instance';
import gasEstimateTokens from './gas_estimate_tokens.json';

const DUMMY_WALLET_ADDRESS = '0x0000000000000000000000000000000000000000';

async function bridgeToL2GasEstimator(
  readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>,
  environment: Environment,
  isSpendingCapApprovalRequired: boolean,
  tokenAddress?: FungibleToken,
): Promise<GasEstimateBridgeToL2Result> {
  const fromChainId = environment === Environment.PRODUCTION ? ChainId.ETHEREUM : ChainId.SEPOLIA;
  const toChainId = environment === Environment.PRODUCTION ? ChainId.IMTBL_ZKEVM_TESTNET : ChainId.IMTBL_ZKEVM_DEVNET;

  const tokenAddresses = environment === Environment.PRODUCTION
    ? gasEstimateTokens[ChainId.SEPOLIA]
    : gasEstimateTokens[ChainId.SEPOLIA];

  const { gasTokenAddress, fromAddress } = tokenAddresses.bridgeToL2Addresses;

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
      isSpendingCapApprovalRequired,
      tokenAddress ?? gasTokenAddress,
    );

    const tokenBridge = await instance.createBridgeInstance(
      fromChainId,
      toChainId,
      readOnlyProviders,
      environment,
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
  environment: Environment,
): Promise<GasEstimateSwapResult> {
  const tokenAddresses = environment === Environment.PRODUCTION
    ? gasEstimateTokens[ChainId.SEPOLIA]
    : gasEstimateTokens[ChainId.SEPOLIA];

  const { inAddress, outAddress } = tokenAddresses.swapAddresses;

  // todo: Use the environment to set chainId and also use zkevm when this is ready for swap
  const chainId = ChainId.SEPOLIA;

  try {
    const exchange = await instance.createExchangeInstance(chainId, environment);

    // Create a fake transaction to get the gas from the quote
    const { info } = await exchange.getUnsignedSwapTxFromAmountIn(
      DUMMY_WALLET_ADDRESS,
      inAddress,
      outAddress,
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

export async function gasEstimator(
  params: GasEstimateParams,
  readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>,
  environment: Environment,
): Promise<GasEstimateSwapResult | GasEstimateBridgeToL2Result> {
  switch (params.gasEstimateType) {
    case GasEstimateType.BRIDGE_TO_L2:
      return await bridgeToL2GasEstimator(
        readOnlyProviders,
        environment,
        params.isSpendingCapApprovalRequired,
        params.tokenAddress,
      );
    case GasEstimateType.SWAP:
      return await swapGasEstimator(environment);
    default:
      throw new CheckoutError(
        'Invalid type provided for gasEstimateType',
        CheckoutErrorType.INVALID_GAS_ESTIMATE_TYPE,
      );
  }
}
