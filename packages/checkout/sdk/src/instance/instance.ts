import {
  BridgeConfiguration,
  ETH_MAINNET_TO_ZKEVM_MAINNET,
  ETH_SEPOLIA_TO_ZKEVM_DEVNET,
  TokenBridge,
} from '@imtbl/bridge-sdk';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { ethers } from 'ethers';
import { Exchange, ExchangeConfiguration } from '@imtbl/dex-sdk';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { ChainId } from '../types';
import { CheckoutConfiguration } from '../config';
import { DexConfig } from '../config/remoteConfigType';

export async function createBridgeInstance(
  fromChainId: ChainId,
  toChainId: ChainId,
  readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>,
  environment: Environment,
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

  const bridgeConfig = new BridgeConfiguration({
    baseConfig: new ImmutableConfiguration({
      environment,
    }),
    bridgeInstance:
      environment === Environment.PRODUCTION
        ? ETH_MAINNET_TO_ZKEVM_MAINNET
        : ETH_SEPOLIA_TO_ZKEVM_DEVNET,

    rootProvider: rootChainProvider,
    childProvider: childChainProvider,
  });

  return new TokenBridge(bridgeConfig);
}

export async function createExchangeInstance(
  chainId: ChainId,
  config: CheckoutConfiguration,
): Promise<Exchange> {
  const dexConfig = (await config.remoteConfigFetcher.get('dex')) as DexConfig;

  return new Exchange(
    new ExchangeConfiguration({
      chainId,
      baseConfig: new ImmutableConfiguration({
        environment: config.environment,
      }),
      overrides: dexConfig?.overrides,
    }),
  );
}
