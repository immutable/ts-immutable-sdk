import { ExchangeModuleConfiguration } from '../types';
import { Environment, ImmutableConfiguration } from '@imtbl/config';
import {
  POLYGON_TESTNET_CHAIN_ID,
  POLYGON_ZKEVM_COMMON_ROUTING_TOKENS,
} from 'constants/tokens';
import { POLYGON_ZKEVM_TESTNET_RPC_URL } from 'constants/rpc';
import { tokenInfoToUniswapToken } from 'lib';
import { Chain } from '../constants/chains';

export class ExchangeConfiguration {
  public baseConfig: ImmutableConfiguration;
  public chain: Chain;

  constructor({ chainId, baseConfig, overrides }: ExchangeModuleConfiguration) {
    this.baseConfig = baseConfig;

    if (overrides) {
      this.chain = {
        chainId: chainId,
        rpcUrl: overrides.rpcURL,
        contracts: overrides.exchangeContracts,
        commonRoutingTokens: tokenInfoToUniswapToken(
          overrides.commonRoutingTokens
        ),
      };

      return;
    }

    const chain =
      SupportedChainIdsForEnvironment[baseConfig.environment][chainId];
    if (!chain) {
      throw new Error(
        `Chain ${chainId} is not supported in environment ${baseConfig.environment}`
      );
    }

    this.chain = chain;
  }
}

export type ExchangeContracts = {
  multicall: string;
  coreFactory: string;
  quoterV2: string;
  peripheryRouter: string;
  migrator: string;
  nonfungiblePositionManager: string;
  tickLens: string;
};

export const ContractsForChainId: { [chainId: number]: ExchangeContracts } = {
  [POLYGON_TESTNET_CHAIN_ID]: {
    multicall: '0x66d0aB680ACEe44308edA2062b910405CC51A190',
    coreFactory: '0x23490b262829ACDAD3EF40e555F23d77D1B69e4e',
    quoterV2: '0x9B323E56215aAdcD4f45a6Be660f287DE154AFC5',
    peripheryRouter: '0x615FFbea2af24C55d737dD4264895A56624Da072',
    migrator: '0x0Df0d2d5Cf4739C0b579C33Fdb3d8B04Bee85729',
    nonfungiblePositionManager: '0x446c78D97b1E78bC35864FC49AcE1f7404F163F6',
    tickLens: '0x3aC4F8094b21A6c5945453007d9c52B7e15340c0',
  },
};

export const SupportedSandboxChains: { [chainId: number]: Chain } = {
  [POLYGON_TESTNET_CHAIN_ID]: {
    chainId: POLYGON_TESTNET_CHAIN_ID,
    rpcUrl: POLYGON_ZKEVM_TESTNET_RPC_URL,
    contracts: ContractsForChainId[POLYGON_TESTNET_CHAIN_ID],
    commonRoutingTokens: POLYGON_ZKEVM_COMMON_ROUTING_TOKENS,
  },
};

export const SupportedProductionChains: { [chainId: number]: Chain } = {};

export const SupportedChainIdsForEnvironment: {
  [key in Environment]: { [chainId: number]: Chain };
} = {
  [Environment.SANDBOX]: SupportedSandboxChains,
  [Environment.PRODUCTION]: SupportedProductionChains,
};
