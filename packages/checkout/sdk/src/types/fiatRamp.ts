// import { Passport } from '@imtbl/passport';

import { Eip1193Provider } from 'ethers';
import { WrappedBrowserProvider } from './provider';

/**
 * An enum representing the type of exchange.
 * @enum {string}
 * @property {string} ONRAMP - The exchange type for transacting.
 */
export enum ExchangeType {
  ONRAMP = 'onramp',
}

/**
 * Interface representing the result of {@link Checkout.createFiatRampUrl}.
 * @property {ExchangeType} exchangeType - The ExchangeType specified.
 * @property {WrappedBrowserProvider | Eip1193Provider} browserProvider - The WrappedBrowserProvider used to exchange.
 * @property {string | undefined} tokenAmount - The token amount specified as input.
 * @property {string | undefined} tokenAddress - The token address specified as input.
 * @property {Passport | undefined} passport - The Passport instance specified as input.
 */
export interface FiatRampParams {
  exchangeType: ExchangeType;
  browserProvider: WrappedBrowserProvider | Eip1193Provider;
  tokenAmount?: string;
  tokenAddress?: string;
  passport?: any;
}
