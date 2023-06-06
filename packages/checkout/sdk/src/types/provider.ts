import { Web3Provider } from '@ethersproject/providers';

export enum DefaultProviders {
  METAMASK = 'metamask',
}

export interface CreateProviderParams {
  providerName: DefaultProviders;
}

export type CreateProviderResult = {
  provider: Web3Provider
};

export type ValidateProviderOptions = {
  fixMixmatchedChain: boolean;
  allowUnsupportedProvider: boolean;
};

export const validateProviderDefaults:ValidateProviderOptions = {
  fixMixmatchedChain: false,
  allowUnsupportedProvider: false,
};
