// @ts-nocheck

import { Environment, ImmutableConfiguration, TokenInfo } from '@imtbl/sdk';
import {
  ExchangeConfiguration,
  ExchangeContracts,
  ExchangeOverrides,
} from '@imtbl/dex-sdk';

const devChainID = +process.env.NEXT_PUBLIC_CHAIN_ID_DEV;

const immutableConfig = new ImmutableConfiguration({
  environment: Environment.SANDBOX,
}); // doesn't really matter what we use here because we'll be overriding all of the config values

const contractOverrides: ExchangeContracts = {
  multicall: process.env.NEXT_PUBLIC_MULTICALL_CONTRACT_DEV,
  coreFactory: process.env.NEXT_PUBLIC_CORE_FACTORY_DEV,
  quoterV2: process.env.NEXT_PUBLIC_QUOTER_V2_DEV,
  peripheryRouter: process.env.NEXT_PUBLIC_PERIPHERY_ROUTER_DEV,
  migrator: process.env.NEXT_PUBLIC_MIGRATOR_DEV,
  nonfungiblePositionManager:
    process.env.NEXT_PUBLIC_NONFUNGIBLE_POSITION_MANAGER_DEV,
  tickLens: process.env.NEXT_PUBLIC_TICK_LENS_DEV,
};

// This list can be updated with any Tokens that are deployed to devnet
// These tokens will be used to find available pools for a swap
const commonRoutingTokens: TokenInfo[] = [
  {
    chainId: devChainID,
    address: process.env.NEXT_PUBLIC_COMMON_ROUTING_FUN,
    decimals: 18,
    symbol: 'FUN',
    name: 'The Fungibles Token',
  },
  {
    chainId: devChainID,
    address: process.env.NEXT_PUBLIC_COMMON_ROUTING_USDC,
    decimals: 18,
    symbol: 'USDC',
    name: 'US Dollar Coin',
  },
  {
    chainId: devChainID,
    address: process.env.NEXT_PUBLIC_COMMON_ROUTING_WETH,
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped Ether',
  },
];

const overrides: ExchangeOverrides = {
  rpcURL: process.env.NEXT_PUBLIC_RPC_URL_DEV,
  exchangeContracts: contractOverrides,
  commonRoutingTokens: commonRoutingTokens,
};
export const configuration = new ExchangeConfiguration({
  chainId: devChainID,
  baseConfig: immutableConfig,
  overrides: overrides,
});
