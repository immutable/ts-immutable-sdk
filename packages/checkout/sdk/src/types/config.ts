import { ModuleConfiguration } from '@imtbl/config';
import { ExchangeOverrides } from '@imtbl/dex-sdk';
import { Passport } from '@imtbl/passport';
import { TokenInfo } from './tokenInfo';
import { ChainId } from './chains';

export interface CheckoutOverrides {}

/**
 * A type representing checkout SDK configurations.
 * @property {object} onramp - To enable on-ramp feature in Checkout sdk.
 * @property {object} swap - To enable swap feature in Checkout sdk.
 * @property {object} bridge - To enable bridge L1 to L2 feature in Checkout sdk.
 * @property {Passport} passport - To enable passport wallet with Checkout sdk.
*/
export interface CheckoutModuleConfiguration extends ModuleConfiguration<CheckoutOverrides> {
  onramp?: {
    enable: boolean;
  };
  swap?: {
    enable: boolean;
  };
  bridge?: {
    enable: boolean;
  };
  passport?: Passport;
}

/**
 * A type representing various remotely defined configurations which are
 * accessible via the Checkout config and configured based on the Environment.
 * @property {DexConfig} dex
 * @property {OnRampConfig} onramp
 * @property {BridgeConfig} bridge
 * @property {AllowedNetworkConfig[]} allowedNetworks
 * @property {GasEstimateTokenConfig | undefined} gasEstimateTokens
 * @property {ImxAddressConfig | undefined} imxAddressMapping
 */
export type RemoteConfiguration = {
  /** The config used for the DEX. */
  dex: DexConfig;
  /** The config used for the OnRamp */
  onramp: OnRampConfig;
  /** The config used for the Bridge. */
  bridge: BridgeConfig;
  /** An array representing the allowed networks. */
  allowedNetworks: AllowedNetworkConfig[];
  /** The config for the tokens used to estimate gas. */
  gasEstimateTokens?: GasEstimateTokenConfig;
  /** The IMX address mappings across available networks. */
  imxAddressMapping?: ImxAddressConfig;
};

/**
 * A type representing the fee structure for an OnRamp provider
 * @property {string | undefined} minPercentage
 * @property {string | undefined} maxPercentage
 * @property {string | undefined} feePercentage
 */
export type OnRampProviderFees = {
  /** The minimum percentage fee shown if a fee range is provided */
  minPercentage?: string;
  /** The maximum percentage fee shown if a fee range is provided */
  maxPercentage?: string;
  /** The specific fee percentage shown if there is no range provided */
  feePercentage?: string;
};

/**
 * A type representing the configuration for the OnRamp for a specific provider.
 * @property {string} publishableApiKey
 * @property {TokenInfo[]} tokens
 * @property {OnRampProviderFees} fees
 */
export type OnRampProviderConfig = {
  /** The on ramp provider publishable api-key */
  publishableApiKey: string,
  /** The allowed tokens for the OnRamp provider */
  tokens: TokenInfo[],
  /** The on ramp provider transaction fees */
  fees: OnRampProviderFees
};

export enum OnRampProvider {
  TRANSAK = '201811419111',
}
/**
 * A type representing the configuration for the OnRamp.
 * @property {OnRampProviderConfig} transak
 */
export type OnRampConfig = {
  /** OnRamp config for Transak provider */
  [key: string]: OnRampProviderConfig;
};

/**
 * A type representing the configuration for the DEX.
 * @property {ExchangeOverrides | undefined} overrides
 * @property {TokenInfo[] | undefined} tokens
 */
export type DexConfig = {
  /** The DEX overrides. */
  overrides?: ExchangeOverrides;
  /** An array of tokens compatible with the DEX. */
  tokens?: TokenInfo[];
};

/**
 * A type representing the configuration for the Bridge.
 * @property {TokenInfo[] | undefined} tokens
 */
export type BridgeConfig = {
  /** An array of tokens compatible with the Bridge. */
  tokens?: TokenInfo[];
};

/**
 * A type representing an allowed network.
 * @property {number} chainId
 */
export type AllowedNetworkConfig = {
  /** The network chain id. */
  chainId: number;
};

/**
 * A type representing the IMX address mappings across available networks.
 * @type {{ [chainId: string]: string }}
 */
export type ImxAddressConfig = {
  [chainId: string]: string;
};

/**
 * A type representing the required information to estimate gas for a transaction.
 * @type {{ [key: string]: { bridgeToL2Addresses?: GasEstimateBridgeToL2TokenConfig, swapAddresses?: GasEstimateSwapTokenConfig } }}
 * - A map of addresses for estimating gas keyed by the network chain id.
 * @property {GasEstimateBridgeToL2TokenConfig | undefined} bridgeToL2Addresses
 * @property {GasEstimateSwapTokenConfig | undefined} swapAddresses
 */
export type GasEstimateTokenConfig = {
  [key: string]: {
    /** The type representing the addresses for a bridge to layer 2 gas estimate. */
    bridgeToL2Addresses?: GasEstimateBridgeToL2TokenConfig;
    /** The type representing the addresses for a swap gas estimate */
    swapAddresses?: GasEstimateSwapTokenConfig;
  };
};

/**
 * A type representing the config for a bridge to layer 2 gas estimate.
 * @property {string | 'NATIVE'} gasTokenAddress
 * @property {string} fromAddress
 */
export type GasEstimateBridgeToL2TokenConfig = {
  /**  The address of the gas token. */
  gasTokenAddress: string | 'NATIVE';
  /** The address of the token being bridged. */
  fromAddress: string;
};

/**
 * A type representing the config for a swap gas estimate.
 * @property {string} inAddress
 * @property {string} outAddress
 */
export type GasEstimateSwapTokenConfig = {
  /** The in token address. */
  inAddress: string;
  /** The out token address. */
  outAddress: string;
};

/**
 * A type that represents the tokens configuration for chain.
 */
export type ChainsTokensConfig = {
  [key in ChainId]: ChainTokensConfig;
};

/**
 * A type representing all the feature flags available.
 * @property {TokenInfo[] | undefined} allowed -
 * @property {boolean | undefined} blockscout -
 */
export type ChainTokensConfig = {
/** List of allowed tokens for a given chain. */
  allowed?: TokenInfo[];
  /** Feature flag to enable/disable blockscout integration. */
  blockscout?: boolean;
};
