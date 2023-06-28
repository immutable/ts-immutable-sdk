import { ExchangeOverrides } from '@imtbl/dex-sdk';
import { Environment } from '@imtbl/config';
import { TokenInfo } from '../types';

export type AllowedNetworkConfig = {
  chainId: number;
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
  tokens?: TokenInfo[];
};

export type RemoteConfiguration = {
  dex: DexConfig;
  allowedNetworks: AllowedNetworkConfig[];
  gasEstimateTokens?: GasEstimateTokenConfig;
};

export type RemoteConfigParams = {
  environment: Environment;
};
