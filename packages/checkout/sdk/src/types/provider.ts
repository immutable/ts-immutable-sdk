import { Web3Provider } from '@ethersproject/providers';

/**
 * Enum representing the avaiable wallet providers to use when creating a provider
 */
export enum WalletProviderName {
  METAMASK = 'metamask',
}
export interface CreateProviderParams {
  providerName: WalletProviderName;
}

/**
 * Interface representing the result of {@link Checkout.createProvider}.
 * @property {Web3Provider} provider - The provider used to connect to the network.
 */
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
