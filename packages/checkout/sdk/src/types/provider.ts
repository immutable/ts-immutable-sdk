import {
  BrowserProvider, BrowserProviderOptions, Eip1193Provider, Networkish,
} from 'ethers';

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

export type ValidateProviderOptions = {
  allowMistmatchedChainId: boolean;
  allowUnsupportedProvider: boolean;
};

export const validateProviderDefaults: ValidateProviderOptions = {
  allowMistmatchedChainId: false,
  allowUnsupportedProvider: false,
};

// export type NamedBrowserProvider = {
//   name: WalletProviderName
// } & BrowserProvider;

export class NamedBrowserProvider extends BrowserProvider {
  name: WalletProviderName;

  // eslint-disable-next-line max-len
  constructor(name: WalletProviderName, ethereum: Eip1193Provider, network?: Networkish, _options?: BrowserProviderOptions) {
    super(ethereum, network, _options);
    this.name = name;
  }
}
