import { Environment } from '@imtbl/config';
import { BridgeInstance, ETH_MAINNET_TO_ZKEVM_MAINNET, ETH_SEPOLIA_TO_ZKEVM_TESTNET } from '@imtbl/bridge-sdk';
import {
  CheckoutModuleConfiguration, ChainId, NetworkMap, ChainSlug,
} from '../types';
import { RemoteConfigFetcher } from './remoteConfigFetcher';
import {
  CHECKOUT_CDN_BASE_URL,
  DEFAULT_BRIDGE_ENABLED,
  DEFAULT_ON_RAMP_ENABLED,
  DEFAULT_SWAP_ENABLED,
  globalPackageVersion,
  IMMUTABLE_API_BASE_URL,
  PRODUCTION_CHAIN_ID_NETWORK_MAP,
  SANDBOX_CHAIN_ID_NETWORK_MAP,
} from '../env';
import { HttpClient } from '../api/http/httpClient';
import { TokensFetcher } from './tokensFetcher';

export class CheckoutConfigurationError extends Error {
  public message: string;

  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export class CheckoutConfiguration {
  readonly isOnRampEnabled: boolean;

  readonly isSwapEnabled: boolean;

  readonly isBridgeEnabled: boolean;

  readonly remote: RemoteConfigFetcher;

  readonly tokens: TokensFetcher;

  readonly environment: Environment;

  readonly publishableKey: string;

  readonly overrides: CheckoutModuleConfiguration['overrides'];

  constructor(config: CheckoutModuleConfiguration, httpClient: HttpClient) {
    if (!Object.values(Environment).includes(config.baseConfig.environment)) {
      throw new CheckoutConfigurationError(
        'Invalid checkout configuration of environment',
      );
    }

    this.environment = config.baseConfig.environment;
    this.isOnRampEnabled = config.onRamp?.enable ?? DEFAULT_ON_RAMP_ENABLED;
    this.isSwapEnabled = config.swap?.enable ?? DEFAULT_SWAP_ENABLED;
    this.isBridgeEnabled = config.bridge?.enable ?? DEFAULT_BRIDGE_ENABLED;
    this.publishableKey = config.publishableKey ?? '<no-publishable-key>';

    this.remote = new RemoteConfigFetcher(httpClient, this.remoteEndpoint);

    this.tokens = new TokensFetcher(httpClient, this.remote, this.baseUrl, this.chainSlug);

    this.overrides = config.overrides ?? {};
  }

  // eslint-disable-next-line class-methods-use-this
  get sdkVersion(): string {
    return globalPackageVersion();
  }

  get remoteEndpoint(): string {
    return this.overrides?.remoteEndpoint ?? CHECKOUT_CDN_BASE_URL[this.environment];
  }

  get baseUrl(): string {
    return this.overrides?.baseUrl ?? IMMUTABLE_API_BASE_URL[this.environment];
  }

  get chainSlug(): ChainSlug {
    if (this.overrides?.chainSlug) return this.overrides.chainSlug;
    if (this.environment === Environment.PRODUCTION) return ChainSlug.IMTBL_ZKEVM_MAINNET;
    return ChainSlug.IMTBL_ZKEVM_TESTNET;
  }

  get bridgeInstance(): BridgeInstance {
    if (this.overrides?.bridgeInstance) return this.overrides.bridgeInstance;
    if (this.environment === Environment.PRODUCTION) return ETH_MAINNET_TO_ZKEVM_MAINNET;
    return ETH_SEPOLIA_TO_ZKEVM_TESTNET;
  }

  get l1ChainId(): ChainId {
    if (this.overrides?.l1ChainId) return this.overrides.l1ChainId;
    if (this.environment === Environment.PRODUCTION) return ChainId.ETHEREUM;
    return ChainId.SEPOLIA;
  }

  get l2ChainId(): ChainId {
    if (this.overrides?.l2ChainId) return this.overrides.l2ChainId;
    if (this.environment === Environment.PRODUCTION) return ChainId.IMTBL_ZKEVM_MAINNET;
    return ChainId.IMTBL_ZKEVM_TESTNET;
  }

  get networkMap(): NetworkMap {
    if (this.overrides?.networkMap) return this.overrides.networkMap;
    return this.environment === Environment.PRODUCTION ? PRODUCTION_CHAIN_ID_NETWORK_MAP : SANDBOX_CHAIN_ID_NETWORK_MAP;
  }
}
