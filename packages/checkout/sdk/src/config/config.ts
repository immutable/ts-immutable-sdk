import { Environment } from '@imtbl/config';
import {
  CheckoutModuleConfiguration, ChainId, NetworkMap, ChainSlug,
} from '../types';
import { RemoteConfigFetcher } from './remoteConfigFetcher';
import {
  CHECKOUT_CDN_BASE_URL,
  DEFAULT_BRIDGE_ENABLED,
  DEFAULT_ON_RAMP_ENABLED,
  DEFAULT_SWAP_ENABLED,
  DEV_CHAIN_ID_NETWORK_MAP,
  ENV_DEVELOPMENT,
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

const networkMap = (prod: boolean, dev: boolean) => {
  if (dev) return DEV_CHAIN_ID_NETWORK_MAP;
  if (prod) return PRODUCTION_CHAIN_ID_NETWORK_MAP;
  return SANDBOX_CHAIN_ID_NETWORK_MAP;
};

const getBaseUrl = (prod: boolean, dev: boolean) => {
  if (dev) return IMMUTABLE_API_BASE_URL[ENV_DEVELOPMENT];
  if (prod) return IMMUTABLE_API_BASE_URL[Environment.PRODUCTION];
  return IMMUTABLE_API_BASE_URL[Environment.SANDBOX];
};

const getChainSlug = (prod: boolean, dev: boolean) => {
  if (dev) return ChainSlug.IMTBL_ZKEVM_DEVNET;
  if (prod) return ChainSlug.IMTBL_ZKEVM_MAINNET;
  return ChainSlug.IMTBL_ZKEVM_TESTNET;
};

export const getL1ChainId = (config: CheckoutConfiguration): ChainId => {
  // DevMode and Sandbox will both use Sepolia.
  if (!config.isProduction) return ChainId.SEPOLIA;
  return ChainId.ETHEREUM;
};

export const getL2ChainId = (config: CheckoutConfiguration): ChainId => {
  if (config.isDevelopment) return ChainId.IMTBL_ZKEVM_DEVNET;
  if (config.isProduction) return ChainId.IMTBL_ZKEVM_MAINNET;
  return ChainId.IMTBL_ZKEVM_TESTNET;
};

const getRemoteConfigEndpoint = (prod: boolean, dev: boolean) => {
  if (dev) return CHECKOUT_CDN_BASE_URL[ENV_DEVELOPMENT];
  if (prod) return CHECKOUT_CDN_BASE_URL[Environment.PRODUCTION];
  return CHECKOUT_CDN_BASE_URL[Environment.SANDBOX];
};

export class CheckoutConfiguration {
  // This is a hidden feature that is only available
  // when building the project from source code.
  // This will be used to get around the lack of
  // Environment.DEVELOPMENT
  readonly isDevelopment: boolean = process.env.CHECKOUT_DEV_MODE === 'true';

  readonly isProduction: boolean;

  readonly isOnRampEnabled: boolean;

  readonly isSwapEnabled: boolean;

  readonly isBridgeEnabled: boolean;

  readonly remote: RemoteConfigFetcher;

  readonly tokens: TokensFetcher;

  readonly environment: Environment;

  readonly networkMap: NetworkMap;

  readonly publishableKey: string;

  readonly l1ChainId: ChainId;

  readonly l2ChainId: ChainId;

  readonly overrides: CheckoutModuleConfiguration['overrides'];

  constructor(config: CheckoutModuleConfiguration, httpClient: HttpClient) {
    if (!Object.values(Environment).includes(config.baseConfig.environment)) {
      throw new CheckoutConfigurationError(
        'Invalid checkout configuration of environment',
      );
    }

    this.environment = config.baseConfig.environment;

    // Developer mode will super set any environment configuration
    this.isProduction = !this.isDevelopment && this.environment === Environment.PRODUCTION;
    this.isOnRampEnabled = config.onRamp?.enable ?? DEFAULT_ON_RAMP_ENABLED;
    this.isSwapEnabled = config.swap?.enable ?? DEFAULT_SWAP_ENABLED;
    this.isBridgeEnabled = config.bridge?.enable ?? DEFAULT_BRIDGE_ENABLED;
    this.publishableKey = config.publishableKey ?? '<no-publishable-key>';

    this.networkMap = config.overrides?.networkMap ?? networkMap(this.isProduction, this.isDevelopment);

    const remoteConfigEndpoint = config.overrides?.remoteConfigEndpoint
      ?? getRemoteConfigEndpoint(this.isProduction, this.isDevelopment);

    this.remote = new RemoteConfigFetcher(httpClient, {
      remoteConfigEndpoint,
    });

    this.tokens = new TokensFetcher(httpClient, this.remote, {
      baseUrl: config.overrides?.baseUrl ?? getBaseUrl(this.isProduction, this.isDevelopment),
      chainSlug: config.overrides?.chainSlug ?? getChainSlug(this.isProduction, this.isDevelopment),
    });

    this.l1ChainId = getL1ChainId(this);
    this.l2ChainId = config.overrides?.l2ChainId ?? getL2ChainId(this);

    this.overrides = config.overrides ?? {};
  }

  // eslint-disable-next-line class-methods-use-this
  get sdkVersion(): string {
    return globalPackageVersion();
  }
}
