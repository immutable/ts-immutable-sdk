import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { IMMUTABLE_TESTNET_COMMON_ROUTING_TOKENS, TIMX_IMMUTABLE_TESTNET } from 'constants/tokens';
import { ChainNotSupportedError, InvalidConfigurationError } from 'errors';
import { IMMUTABLE_TESTNET_CHAIN_ID, IMMUTABLE_TESTNET_RPC_URL } from 'constants/chains';
import { isValidNonZeroAddress } from 'lib';
import { Chain, ExchangeModuleConfiguration, ExchangeOverrides } from '../types';

export type ExchangeContracts = {
  multicall: string;
  coreFactory: string;
  quoterV2: string;
  peripheryRouter: string;
};

export const CONTRACTS_FOR_CHAIN_ID: { [chainId: number]: ExchangeContracts } = {
  [IMMUTABLE_TESTNET_CHAIN_ID]: {
    multicall: '0x66d0aB680ACEe44308edA2062b910405CC51A190',
    coreFactory: '0x23490b262829ACDAD3EF40e555F23d77D1B69e4e',
    quoterV2: '0x9B323E56215aAdcD4f45a6Be660f287DE154AFC5',
    peripheryRouter: '0x615FFbea2af24C55d737dD4264895A56624Da072',
  },
};

export const SUPPORTED_SANDBOX_CHAINS: { [chainId: number]: Chain } = {
  [IMMUTABLE_TESTNET_CHAIN_ID]: {
    chainId: IMMUTABLE_TESTNET_CHAIN_ID,
    rpcUrl: IMMUTABLE_TESTNET_RPC_URL,
    contracts: CONTRACTS_FOR_CHAIN_ID[IMMUTABLE_TESTNET_CHAIN_ID],
    commonRoutingTokens: IMMUTABLE_TESTNET_COMMON_ROUTING_TOKENS,
    nativeToken: TIMX_IMMUTABLE_TESTNET,
  },
};

export const SUPPORTED_PRODUCTION_CHAINS: { [chainId: number]: Chain } = {};

export const SUPPORTED_CHAIN_IDS_FOR_ENVIRONMENT: {
  [key in Environment]: { [chainId: number]: Chain };
} = {
  [Environment.SANDBOX]: SUPPORTED_SANDBOX_CHAINS,
  [Environment.PRODUCTION]: SUPPORTED_PRODUCTION_CHAINS,
};

function validateOverrides(overrides: ExchangeOverrides) {
  if (!overrides.rpcURL || !overrides.exchangeContracts || !overrides.commonRoutingTokens || !overrides.nativeToken) {
    throw new InvalidConfigurationError();
  }

  Object.values(overrides.exchangeContracts).forEach((contract) => {
    if (!isValidNonZeroAddress(contract)) {
      throw new InvalidConfigurationError();
    }
  });
}

/**
 * {@link ExchangeConfiguration} is used to configure the {@link Exchange} class.
 * @param chainId the ID of the chain to configure. {@link SUPPORTED_CHAIN_IDS_FOR_ENVIRONMENT} contains the supported chains for each environment.
 * @param baseConfig the base {@link ImmutableConfiguration} for the {@link Exchange} class
 */
export class ExchangeConfiguration {
  public baseConfig: ImmutableConfiguration;

  public chain: Chain;

  constructor({ chainId, baseConfig, overrides }: ExchangeModuleConfiguration) {
    this.baseConfig = baseConfig;

    if (overrides) {
      validateOverrides(overrides);
      this.chain = {
        chainId,
        rpcUrl: overrides.rpcURL,
        contracts: overrides.exchangeContracts,
        commonRoutingTokens: overrides.commonRoutingTokens,
        nativeToken: overrides.nativeToken,
      };

      return;
    }

    const chain = SUPPORTED_CHAIN_IDS_FOR_ENVIRONMENT[baseConfig.environment][chainId];
    if (!chain) {
      throw new ChainNotSupportedError(chainId, baseConfig.environment);
    }

    this.chain = chain;
  }
}
