import { TokenInfo } from '../types';

export type RemoteConfigParams = {
  isDevelopment: boolean;
  isProduction: boolean;
};

export type ConfiguredTokens = {
  [key: string]: {
    allowed?: TokenInfo[];
  };
};
