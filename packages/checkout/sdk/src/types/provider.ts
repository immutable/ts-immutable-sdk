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
  allowMistmatchedChainId: boolean;
  allowUnsupportedProvider: boolean;
};

export const validateProviderDefaults:ValidateProviderOptions = {
  allowMistmatchedChainId: false,
  allowUnsupportedProvider: false,
};
