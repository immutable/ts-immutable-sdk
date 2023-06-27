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
};

export type IndexerConfig = {
  urls: {
    chainId: number;
    rootUrl: string;
    tokensPath: string;
  }[];
};

export type ConfiguredTokens = {
  [key: string]: {
    allowed?: TokenInfo[];
    metadata?: TokenInfo[];
  };
};

export type RemoteConfiguration = {
  dex: DexConfig;
  allowedNetworks: AllowedNetworkConfig[];
  gasEstimateTokens?: GasEstimateTokenConfig;
  indexer?: IndexerConfig;
};

export type RemoteConfigParams = {
  environment: Environment;
};
