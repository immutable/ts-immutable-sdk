import { TokenInfo } from '../types';

export type ConfiguredTokens = {
  [key: string]: {
    allowed?: TokenInfo[];
  };
};
