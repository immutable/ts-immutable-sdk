// import { Passport } from '@imtbl/passport';

import { BrowserProvider } from 'ethers';

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
 * @property {BrowserProvider} web3Provider - The BrowserProvider used to exchange.
 * @property {string | undefined} tokenAmount - The token amount specified as input.
 * @property {string | undefined} tokenAddress - The token address specified as input.
 * @property {Passport | undefined} passport - The Passport instance specified as input.
 */
export interface FiatRampParams {
  exchangeType: ExchangeType;
  web3Provider: BrowserProvider;
  tokenAmount?: string;
  tokenAddress?: string;
  passport?: any;
}
