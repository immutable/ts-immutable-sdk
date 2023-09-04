import { Web3Provider } from '@ethersproject/providers';
import { Passport } from '@imtbl/passport';
import { BigNumber } from 'ethers';

/**
 * An enum representing the type of exchange.
 * @enum {string}
 * @property {string} ONRAMP - The exchange type for transacting.
 */
export enum ExchangeType {
  ONRAMP = 'onramp',
}

/**
 * Interface representing the result of {@link Checkout.generateTransakWidgetUrl}.
 * @property {ExchangeType} exchangeType - The ExchangeType specified.
 * @property {Web3Provider} web3Provider - The Web3Provider used to exchange.
 * @property {string | undefined} tokenAmount - The token amount specified as input.
 * @property {string | undefined} tokenSymbol - The token symbol specified as input.
 * @property {Passport | undefined} passport - The Passport instance specified as input.
 */
export interface CryptoFiatExchangeParams {
  exchangeType: ExchangeType;
  web3Provider: Web3Provider;
  tokenAmount?: BigNumber;
  tokenAddress?: string;
  passport?: Passport;
}
