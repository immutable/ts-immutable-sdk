import { Web3Provider } from '@ethersproject/providers';
import { Passport } from '@imtbl/passport';

/**
 * Enum representing the names of different wallet providers.
 */
export enum WalletProviderName {
  PASSPORT = 'passport',
  METAMASK = 'metamask',
}

/**
 * Interface for the parameters required to create a wallet provider {@link Checkout.createProvider}.
 * @interface CreateProviderParams
 * @property {WalletProviderName} walletProvider - The name of the wallet provider.
 * @property {Passport | undefined} passport - The Passport instance required to create a provider for passport users.
 * If walletProvider is 'passport', then the passport instance must be passed in.
 */
export interface CreateProviderParams {
  walletProvider: WalletProviderName;
  passport?: Passport;
}

/**
 * Represents the result of creating a Web3 provider {@link Checkout.createProvider}.
 * @property {Web3Provider} provider - The created Web3 provider.
 * @property {WalletProviderName} providerName - The name of the wallet provider.
 */
export type CreateProviderResult = {
  provider: Web3Provider,
  walletProviderName: WalletProviderName
};

export type ValidateProviderOptions = {
  allowMistmatchedChainId: boolean;
  allowUnsupportedProvider: boolean;
};

export const validateProviderDefaults:ValidateProviderOptions = {
  allowMistmatchedChainId: false,
  allowUnsupportedProvider: false,
};
