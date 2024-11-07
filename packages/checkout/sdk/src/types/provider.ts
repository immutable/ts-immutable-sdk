import { BrowserProvider } from 'ethers';

/**
 * Enum representing the names of different wallet providers.
 */
export enum WalletProviderName {
  PASSPORT = 'passport',
  METAMASK = 'metamask',
  WALLETCONNECT = 'walletconnect',
}

/**
 * Enum representing the rdns of injected wallet providers.
 */
export enum WalletProviderRdns {
  PASSPORT = 'com.immutable.passport',
  METAMASK = 'io.metamask',
  WALLETCONNECT = 'walletconnect',
}

/**
 * Interface for the parameters required to create a wallet provider {@link Checkout.createProvider}.
 * @interface CreateProviderParams
 * @property {WalletProviderName} walletProviderName - The wallet provider name to create a provider for.
 */
export interface CreateProviderParams {
  walletProviderName: WalletProviderName;
}

/**
 * Represents the result of creating a Web3 provider {@link Checkout.createProvider}.
 * @property {BrowserProvider} provider - The created Web3 provider.
 * @property {WalletProviderName} walletProviderName - The wallet provider name of the provider that was created.
 */
export type CreateProviderResult = {
  provider: BrowserProvider,
  walletProviderName: WalletProviderName
};

export type ValidateProviderOptions = {
  allowMistmatchedChainId: boolean;
  allowUnsupportedProvider: boolean;
};

export const validateProviderDefaults: ValidateProviderOptions = {
  allowMistmatchedChainId: false,
  allowUnsupportedProvider: false,
};
