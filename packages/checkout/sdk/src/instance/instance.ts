import {
  BridgeConfiguration,
  ETH_MAINNET_TO_ZKEVM_MAINNET,
  ETH_SEPOLIA_TO_ZKEVM_DEVNET,
  ETH_SEPOLIA_TO_ZKEVM_TESTNET,
  TokenBridge,
} from '@imtbl/bridge-sdk';
import { ImmutableConfiguration } from '@imtbl/config';
import { ethers } from 'ethers';
import { Exchange } from '@imtbl/dex-sdk';
import { Orderbook } from '@imtbl/orderbook';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { ChainId, DexConfig } from '../types';
import { CheckoutConfiguration } from '../config';

export async function createBridgeInstance(
  fromChainId: ChainId,
  toChainId: ChainId,
  readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>,
  config: CheckoutConfiguration,
): Promise<TokenBridge> {
  const rootChainProvider = readOnlyProviders.get(fromChainId);
  const childChainProvider = readOnlyProviders.get(toChainId);

  if (!rootChainProvider) {
    throw new CheckoutError(
      `Chain:${fromChainId} is not a supported chain`,
      CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR,
    );
  }
  if (!childChainProvider) {
    throw new CheckoutError(
      `Chain:${toChainId} is not a supported chain`,
      CheckoutErrorType.CHAIN_NOT_SUPPORTED_ERROR,
    );
  }

  let bridgeInstance = ETH_SEPOLIA_TO_ZKEVM_TESTNET;
  if (config.isDevelopment) bridgeInstance = ETH_SEPOLIA_TO_ZKEVM_DEVNET;
  if (config.isProduction) bridgeInstance = ETH_MAINNET_TO_ZKEVM_MAINNET;

  const bridgeConfig = new BridgeConfiguration({
    baseConfig: new ImmutableConfiguration({ environment: config.environment }),
    bridgeInstance,
    rootProvider: rootChainProvider,
    childProvider: childChainProvider,
  });

  return new TokenBridge(bridgeConfig);
}

export async function createExchangeInstance(
  chainId: ChainId,
  config: CheckoutConfiguration,
): Promise<Exchange> {
  const dexConfig = (await config.remote.getConfig(
    'dex',
  )) as DexConfig;

  return new Exchange({
    chainId,
    baseConfig: new ImmutableConfiguration({
      environment: config.environment,
    }),
    overrides: dexConfig?.overrides,
  });
}

export async function createOrderbookInstance(
  config: CheckoutConfiguration,
): Promise<Orderbook> {
  return new Orderbook({
    baseConfig: {
      environment: config.environment,
    },
  });
}
