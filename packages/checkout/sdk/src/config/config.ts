import { Environment } from '@imtbl/config';
import {
  CheckoutModuleConfiguration,
  NetworkMap,
  DEV_CHAIN_ID_NETWORK_MAP,
  PRODUCTION_CHAIN_ID_NETWORK_MAP,
  SANDBOX_CHAIN_ID_NETWORK_MAP,
  ChainId,
  DEFAULT_ON_RAMP_ENABLED,
  DEFAULT_SWAP_ENABLED,
  DEFAULT_BRIDGE_ENABLED,
} from '../types';
import { RemoteConfigFetcher } from './remoteConfigFetcher';
import { availabilityService } from './availabilityService';

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

// **************************************************** //
// This is duplicated in the widget-lib project.        //
// We are not exposing these functions given that this  //
// to keep the Checkout SDK interface as minimal as     //
// possible.                                            //
// **************************************************** //
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
// **************************************************** //
// **************************************************** //

export class CheckoutConfiguration {
  // This is a hidden feature that is only available
  // when building the project from source code.
  // This will be used to get around the lack of
  // Environment.DEVELOPMENT
  readonly isDevelopment: boolean = process.env.CHECKOUT_DEV_MODE !== undefined;

  readonly isProduction: boolean;

  readonly isOnRampEnabled: boolean;

  readonly isSwapEnabled: boolean;

  readonly isBridgeEnabled: boolean;

  readonly remote: RemoteConfigFetcher;

  readonly environment: Environment;

  readonly networkMap: NetworkMap;

  // readonly availability: { checkOnRampAvailability: () => Promise<void>; checkDexAvailability: () => Promise<boolean> };

  constructor(config: CheckoutModuleConfiguration) {
    if (!Object.values(Environment).includes(config.baseConfig.environment)) {
      throw new CheckoutConfigurationError(
        'Invalid checkout configuration of environment',
      );
    }

    this.environment = config.baseConfig.environment;

    // Developer mode will super set any environment configuration
    this.isProduction = !this.isDevelopment && this.environment === Environment.PRODUCTION;
    this.isOnRampEnabled = config.isOnRampEnabled ?? DEFAULT_ON_RAMP_ENABLED;
    this.isSwapEnabled = config.isSwapEnabled ?? DEFAULT_SWAP_ENABLED;
    this.isBridgeEnabled = config.isBridgeEnabled ?? DEFAULT_BRIDGE_ENABLED;

    this.networkMap = networkMap(
      this.isProduction,
      this.isDevelopment,
    );

    // this.availability = availabilityService(this.isDevelopment, this.isProduction);

    this.remote = new RemoteConfigFetcher({
      isDevelopment: this.isDevelopment,
      isProduction: this.isProduction,
    });
  }
}
