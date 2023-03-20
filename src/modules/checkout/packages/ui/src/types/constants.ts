import { Network } from "@imtbl/checkout-sdk-web";

export enum ProviderIdentifiedNetwork {
  MATIC = 'matic',
  HOMESTEAD = 'homestead',
  GOERLI = 'goerli',
}

export type NetworkNameMapType = {
  [key in ProviderIdentifiedNetwork]: string;
};

export const NetworkNameMap:NetworkNameMapType = {
  [ProviderIdentifiedNetwork.MATIC]: Network.POLYGON,
  [ProviderIdentifiedNetwork.HOMESTEAD]: Network.ETHEREUM,
  [ProviderIdentifiedNetwork.GOERLI]: Network.GOERLI
};

export type NetworkCurrencyMapType = {
  [key in Network]: string;
};
export const NetworkCurrencyMap:NetworkCurrencyMapType = {
  [Network.POLYGON]: 'MATIC',
  [Network.ETHEREUM]: 'ETH',
  [Network.GOERLI]: 'gETH'
};
