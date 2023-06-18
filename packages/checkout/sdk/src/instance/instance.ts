import {
  TokenBridge, BridgeConfiguration, ETH_MAINNET_TO_ZKEVM_MAINNET, ETH_SEPOLIA_TO_ZKEVM_DEVNET,
} from '@imtbl/bridge-sdk';
import { ImmutableConfiguration, Environment } from '@imtbl/config';
import { ethers } from 'ethers';
import { Exchange, ExchangeConfiguration } from '@imtbl/dex-sdk';
import { CheckoutError, CheckoutErrorType } from '../errors';
import { ChainId } from '../types';
import { RemoteConfig } from '../config/remoteConfig';

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
  environment: Environment,
): Promise<Exchange> {
  let overrides;

  try {
    overrides = (await new RemoteConfig({ environment }).load())?.dex?.overrides;
  } catch (err) {
    console.error(err);
  }

  const exchange = new Exchange(new ExchangeConfiguration({
    chainId,
    baseConfig: new ImmutableConfiguration({ environment }),
    overrides,
  }));

  return exchange;
}
