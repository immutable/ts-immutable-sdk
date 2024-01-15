import * as imxClient from './immutablex_client';
import * as imxProvider from './provider';

export const x = {
  client: imxClient,
  provider: imxProvider,
};
export * as config from './config';
export * as blockchainData from './blockchain_data';
/**
 * @deprecated Use x.client or /x/client instead.
 */
export * as immutablexClient from './immutablex_client';
export * as passport from './passport';
export * as orderbook from './orderbook';
/**
 * @deprecated Use x.provider or /x/provider instead.
 */
export * as provider from './provider';
export * as checkout from './checkout';
