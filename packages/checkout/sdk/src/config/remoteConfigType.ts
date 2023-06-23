import { ExchangeOverrides } from '@imtbl/dex-sdk';
import { Environment } from '@imtbl/config';

export type AllowedNetworkConfig = {
  chainId: number;
};

export type AllowedWalletConfig = {
  providerName: string;
  name?: string;
  description?: string;
  icon?: string;
  platform?: string[];
};

export type GasEstimateBridgeToL2TokenConfig = {
  gasTokenAddress: string | 'NATIVE';
  fromAddress: string;
};

export type GasEstimateSwapTokenConfig = {
  inAddress: string;
  outAddress: string;
};
export type GasEstimateTokenConfig = {
  [key: string]: {
    bridgeToL2Addresses?: GasEstimateBridgeToL2TokenConfig;
    swapAddresses?: GasEstimateSwapTokenConfig;
  };
};

export type DexConfig = {
  overrides?: ExchangeOverrides;
};

export type RemoteConfiguration = {
  dex: DexConfig;
  allowedNetworks: AllowedNetworkConfig[];
  gasEstimateTokens?: GasEstimateTokenConfig;
  allowedWallets?: AllowedWalletConfig[];
};

export type RemoteConfigParams = {
  environment: Environment;
};
