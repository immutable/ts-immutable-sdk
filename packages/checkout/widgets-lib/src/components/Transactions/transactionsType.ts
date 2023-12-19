import { TokenInfo } from '@imtbl/checkout-sdk';

export type KnownNetworkMap = {
  [chainName: string]: {
    [address: string]: TokenInfo
  }
};
