import { Environment, ImmutableConfiguration } from '@imtbl/config';
import {
  ERC20, ExchangeConfiguration, ExchangeContracts, ExchangeOverrides, Native,
} from '@imtbl/dex-sdk';

/**
 * The configuration in this file can be used to override the default configuration values
 */

const chainId = 15001;
const rpcURL = 'https://rpc.dev.immutable.com/';

const immutableConfig = new ImmutableConfiguration({
  environment: Environment.SANDBOX,
}); // doesn't really matter what we use here because we'll be overriding all of the config values

const contractOverrides: ExchangeContracts = {
  multicall: '0x9482D1727424B6C3EeaA22B037FFBC3ae6748f66',
  coreFactory: '0x8081d5F526b7Aaf4868e6C53Aa8a9d9D93c10562',
  quoter: '0xC12B5c73951CFD922979638b5d19C593ac51dcDA',
  swapRouter: '0x8089b5D6fa3f19C64081d5050c5CA3a66f34C5af',
  immutableSwapProxy: '0x0234ceca85Efb0c3a751088d328F3db3d397DDBF',
};

const wrappedNativeToken: ERC20 = {
  type: 'erc20',
  chainId,
  address: '0xB9Caa0aaC9f110028a30B5735454Bb5e1f7be381',
  decimals: 18,
  symbol: 'WIMX',
  name: 'Wrapped Immutable X Token',
};

const nativeToken: Native = {
  type: 'native',
  chainId,
  decimals: 18,
  symbol: 'IMX',
  name: 'Immutable X Token',
};

// This list can be updated with any Tokens that are deployed to the chain being configured
// These tokens will be used to find available pools for a swap
const commonRoutingTokens: ERC20[] = [wrappedNativeToken];

const overrides: ExchangeOverrides = {
  rpcURL,
  exchangeContracts: contractOverrides,
  commonRoutingTokens,
  nativeToken,
  wrappedNativeToken,
};

export const configuration = new ExchangeConfiguration({
  chainId,
  baseConfig: immutableConfig,
  overrides,
});
