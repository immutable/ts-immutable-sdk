import { Web3Provider } from '@ethersproject/providers';
import { ChainId, NetworkInfo } from './network';

export enum DefaultProviders {
  METAMASK = 'metamask',
}

export interface CreateProviderParams {
  providerName: DefaultProviders;
}

export type CreateProviderResult = GenericProvider;

export type SetProviderParams = GenericProvider;

export interface SetProviderResult {
  providers: Providers;
  currentProvider: string;
  currentNetwork: NetworkInfo;
}

export interface Providers {
  [key: string]: ProviderForChain;
}

export type ProviderForChain = {
  [key in ChainId | number]: Web3Provider;
};

export interface GenericProvider {
  name: string | DefaultProviders;
  web3Provider: Web3Provider;
}

export interface ProviderInfo {
  currentProvider?: string | DefaultProviders;
  currentNetwork?: NetworkInfo;
  providers?: Providers;
}
