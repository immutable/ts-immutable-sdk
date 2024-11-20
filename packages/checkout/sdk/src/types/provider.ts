import {
  BrowserProvider, BrowserProviderOptions, Eip1193Provider as EthersEip1193Provider, Networkish,
} from 'ethers';
import { EIP1193Provider } from './eip1193';

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

  ethereumProvider: EIP1193Provider | undefined;

  // eslint-disable-next-line max-len
  constructor(name: WalletProviderName, ethereum: EthersEip1193Provider, network?: Networkish, _options?: BrowserProviderOptions) {
    super(ethereum, network, _options);
    this.name = name;

    this.#setEthereumProvider(ethereum);
  }

  #setEthereumProvider(ethereum: EthersEip1193Provider) {
    if (!('on' in ethereum) || typeof ethereum.on !== 'function') {
      return;
    }

    if (!('removeListener' in ethereum) || typeof ethereum.removeListener !== 'function') {
      return;
    }

    this.ethereumProvider = ethereum as unknown as EIP1193Provider;
  }
}
