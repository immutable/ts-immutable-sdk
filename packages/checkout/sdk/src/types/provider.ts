import { Web3Provider } from '@ethersproject/providers';
import { ChainId } from './network';

export enum DefaultProviders {
  METAMASK = 'metamask',
}

export interface CreateProviderParams {
  providerName: DefaultProviders;
}

export interface CreateProviderResult {
  name: DefaultProviders;
  web3Provider: Web3Provider;
}

export type SetProviderParams = Array<GenericProvider>;

export interface SetProviderResult {
  providers: Providers;
}

export interface Providers {
  [key: string]: ProviderForChain;
}

export type ProviderForChain = {
  [key in ChainId]: Web3Provider;
};

export interface GenericProvider {
  name: string;
  web3Provider: Web3Provider | undefined;
}
