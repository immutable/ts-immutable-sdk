import { ModuleConfiguration } from '@imtbl/config';
import { ExchangeOverrides } from '@imtbl/dex-sdk';
import { TokenInfo } from './tokenInfo';
import { ChainId } from './chains';

export interface CheckoutOverrides {}
export interface CheckoutModuleConfiguration extends ModuleConfiguration<CheckoutOverrides> {
  isOnRampEnabled?: boolean,
  isSwapEnabled?: boolean,
  isBridgeEnabled?: boolean,
}

/**
 * A type representing various remotely defined configurations which are
 * accessible via the Checkout config and configured based on the Environment.
 * @property {DexConfig} dex - The config used for the DEX.
 * @property {OnRampConfig} onramp - The config used for the OnRamp
 * @property {AllowedNetworkConfig[]} allowedNetworks - An array representing the allowed networks.
 * @property {GasEstimateTokenConfig | undefined} gasEstimateTokens - The config for the tokens used to estimate gas.
 */
export type RemoteConfiguration = {
  dex: DexConfig;
  onramp: OnRampConfig;
  allowedNetworks: AllowedNetworkConfig[];
  gasEstimateTokens?: GasEstimateTokenConfig;
};

/**
 * A type representing the fee structure for an OnRamp provider
 * @property {string | undefined} minPercentage - minimum percentage fee shown if a fee range is provided
 * @property {string | undefined} maxPercentage - maximum percentage fee shown if a fee range is provided
 * @property {string | undefined} feePercentage - specific fee percentage shown if there is no range provided
 */
export type OnRampProviderFees = {
  minPercentage?: string;
  maxPercentage?: string;
  feePercentage?: string;
};

/**
 * A type representing the configuration for the OnRamp for a specific provider.
 * @property {TokenInfo[]} tokens - allowed tokens for the OnRamp provider
 * @property {OnRampProviderFees} fees - on ramp provider transaction fees
 */
export type OnRampProviderConfig = {
  tokens: TokenInfo[],
  fees: OnRampProviderFees
};

export enum OnRampProvider {
  TRANSAK = '201811419111',
}
/**
 * A type representing the configuration for the OnRamp.
 * @property {OnRampProviderConfig} transak - OnRamp config for Transak provider
 */
export type OnRampConfig = {
  [key: string]: OnRampProviderConfig;
};

/**
 * A type representing the configuration for the DEX.
 * @property {ExchangeOverrides | undefined} overrides - The DEX overrides.
 * @property {TokenInfo[] | undefined} tokens - An array of tokens compatible with the DEX.
 */
export type DexConfig = {
  overrides?: ExchangeOverrides;
  tokens?: TokenInfo[];
};

/**
 * A type representing an allowed network.
 * @property {number} chainId - The network chain id.
 */
export type AllowedNetworkConfig = {
  chainId: number;
};

/**
 * A type representing the required information to estimate gas for a transaction.
 * @type {{ [key: string]: { bridgeToL2Addresses?: GasEstimateBridgeToL2TokenConfig, swapAddresses?: GasEstimateSwapTokenConfig } }}
 * - A map of addresses for estimating gas keyed by the network chain id.
 * @property {GasEstimateBridgeToL2TokenConfig | undefined} bridgeToL2Addresses
 * - The type representing the addresses for a bridge to layer 2 gas estimate.
 * @property {GasEstimateSwapTokenConfig | undefined} swapAddresses - The type representing the addresses for a swap gas estimate
 */
export type GasEstimateTokenConfig = {
  [key: string]: {
    bridgeToL2Addresses?: GasEstimateBridgeToL2TokenConfig;
    swapAddresses?: GasEstimateSwapTokenConfig;
  };
};

/**
 * A type representing the config for a bridge to layer 2 gas estimate.
 * @property {string | 'NATIVE'} gasTokenAddress - The address of the gas token.
 * @property {string} fromAddress - The address of the token being bridged.
 */
export type GasEstimateBridgeToL2TokenConfig = {
  gasTokenAddress: string | 'NATIVE';
  fromAddress: string;
};

/**
 * A type representing the config for a swap gas estimate.
 * @property {string} inAddress - The in token address.
 * @property {string} outAddress - The out token address.
 */
export type GasEstimateSwapTokenConfig = {
  inAddress: string;
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
 * @property {TokenInfo[] | undefined} allowed - List of allowed tokens for a given chain.
 * @property {boolean | undefined} blockscout - Feature flag to enable/disable blockscout integration.
 */
export type ChainTokensConfig = {
  allowed?: TokenInfo[];
  blockscout?: boolean;
};
