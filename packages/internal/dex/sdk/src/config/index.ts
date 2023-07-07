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

export const CONTRACTS_FOR_CHAIN_ID: Record<number, ExchangeContracts> = {
  [IMMUTABLE_TESTNET_CHAIN_ID]: {
    multicall: '0xb18c44b211065E69844FbA9AE146DA362104AfBf',
    coreFactory: '0x12739A8f1A8035F439092D016DAE19A2874F30d2',
    quoterV2: '0xF674847fBcca5C80315e3AE37043Dce99F6CC529',
    peripheryRouter: '0x0Afe6F5f4DC34461A801420634239FFaD50A2e44',
  },
};

export const SUPPORTED_SANDBOX_CHAINS: Record<number, Chain> = {
  [IMMUTABLE_TESTNET_CHAIN_ID]: {
    chainId: IMMUTABLE_TESTNET_CHAIN_ID,
    rpcUrl: IMMUTABLE_TESTNET_RPC_URL,
    contracts: CONTRACTS_FOR_CHAIN_ID[IMMUTABLE_TESTNET_CHAIN_ID],
    commonRoutingTokens: IMMUTABLE_TESTNET_COMMON_ROUTING_TOKENS,
    nativeToken: TIMX_IMMUTABLE_TESTNET,
  },
};

export const SUPPORTED_PRODUCTION_CHAINS: Record<number, Chain> = {};

export const SUPPORTED_CHAIN_IDS_FOR_ENVIRONMENT: Record<Environment, Record<number, Chain>> = {
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
