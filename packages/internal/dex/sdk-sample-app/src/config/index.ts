// @ts-nocheck

import { Environment, ImmutableConfiguration, TokenInfo } from '@imtbl/sdk';
import {
  ExchangeConfiguration,
  ExchangeContracts,
  ExchangeOverrides,
} from '@imtbl/dex-sdk';

const chainId = +process.env.NEXT_PUBLIC_CHAIN_ID;

const immutableConfig = new ImmutableConfiguration({
  environment: Environment.SANDBOX,
}); // doesn't really matter what we use here because we'll be overriding all of the config values

const contractOverrides: ExchangeContracts = {
  multicall: process.env.NEXT_PUBLIC_MULTICALL_CONTRACT,
  coreFactory: process.env.NEXT_PUBLIC_CORE_FACTORY,
  quoterV2: process.env.NEXT_PUBLIC_QUOTER_V2,
  peripheryRouter: process.env.NEXT_PUBLIC_PERIPHERY_ROUTER,
  migrator: process.env.NEXT_PUBLIC_MIGRATOR,
  nonfungiblePositionManager:
    process.env.NEXT_PUBLIC_NONFUNGIBLE_POSITION_MANAGER,
  tickLens: process.env.NEXT_PUBLIC_TICK_LENS,
};

// This list can be updated with any Tokens that are deployed to the chain being configured
// These tokens will be used to find available pools for a swap
const commonRoutingTokens: TokenInfo[] = [
  {
    chainId,
    address: process.env.NEXT_PUBLIC_COMMON_ROUTING_FUN,
    decimals: 18,
    symbol: 'FUN',
    name: 'The Fungibles Token',
  },
  {
    chainId,
    address: process.env.NEXT_PUBLIC_COMMON_ROUTING_USDC,
    decimals: 18,
    symbol: 'USDC',
    name: 'US Dollar Coin',
  },
  {
    chainId,
    address: process.env.NEXT_PUBLIC_COMMON_ROUTING_WETH,
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped Ether',
  },
];

const overrides: ExchangeOverrides = {
  rpcURL: process.env.NEXT_PUBLIC_RPC_URL,
  exchangeContracts: contractOverrides,
  commonRoutingTokens,
  nativeToken: {
    chainId,
    address: '0xd1da7e9b2Ce1a4024DaD52b3D37F4c5c91a525C1',
    decimals: 18,
    symbol: 'IMX',
    name: 'Immutable X Token',
  },
};
export const configuration = new ExchangeConfiguration({
  chainId,
  baseConfig: immutableConfig,
  overrides,
});
