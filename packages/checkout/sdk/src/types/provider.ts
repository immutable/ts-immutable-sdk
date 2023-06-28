import { Web3Provider } from '@ethersproject/providers';

/**
 * Enum representing the names of different wallet providers.
 */
export enum WalletProviderName {
  METAMASK = 'metamask',
}

/**
 * Interface for the parameters required to create a wallet provider.
 * @interface CreateProviderParams
 * @property {WalletProviderName} walletProvider - The name of the wallet provider.
 */
export interface CreateProviderParams {
  walletProvider: WalletProviderName;
}

/**
 * Represents the result of creating a Web3 provider.
 * @property {Web3Provider} provider - The created Web3 provider.
 */
export type CreateProviderResult = {
  provider: Web3Provider
};

/**
 * Represents the options for validating a provider.
 */
export type ValidateProviderOptions = {
  allowMistmatchedChainId: boolean;
  allowUnsupportedProvider: boolean;
};

/**
 * Default options for validating a provider.
 * @type {ValidateProviderOptions}
 * @property {boolean} allowMistmatchedChainId - Whether to allow a mismatched chain ID between the provider and the expected chain ID.
 * @property {boolean} allowUnsupportedProvider - Whether to allow an unsupported provider.
 */
export const validateProviderDefaults:ValidateProviderOptions = {
  allowMistmatchedChainId: false,
  allowUnsupportedProvider: false,
};
