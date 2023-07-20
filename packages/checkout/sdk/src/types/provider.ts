import { Web3Provider } from '@ethersproject/providers';

/**
 * Enum representing the names of different wallet providers.
 */
export enum WalletProviderName {
  METAMASK = 'metamask',
}

/**
 * Interface for the parameters required to create a wallet provider {@link Checkout.createProvider}.
 * @interface CreateProviderParams
 * @property {WalletProviderName} walletProvider - The name of the wallet provider.
 */
export interface CreateProviderParams {
  walletProvider: WalletProviderName;
}

/**
 * Represents the result of creating a Web3 provider {@link Checkout.createProvider}.
 * @property {Web3Provider} provider - The created Web3 provider.
 * @property {WalletProviderName} providerName - The name of the wallet provider.
 */
export type CreateProviderResult = {
  provider: Web3Provider,
  providerName: WalletProviderName
};

export type ValidateProviderOptions = {
  allowMistmatchedChainId: boolean;
  allowUnsupportedProvider: boolean;
};

export const validateProviderDefaults:ValidateProviderOptions = {
  allowMistmatchedChainId: false,
  allowUnsupportedProvider: false,
};
