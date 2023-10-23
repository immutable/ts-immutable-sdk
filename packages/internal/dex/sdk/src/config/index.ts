import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { ChainNotSupportedError, InvalidConfigurationError } from 'errors';
import { isValidNonZeroAddress } from 'lib';
import { ExchangeModuleConfiguration, ExchangeOverrides, SecondaryFee, Chain } from '../types';
import {
  IMMUTABLE_TESTNET_CHAIN_ID,
  IMMUTABLE_TESTNET_COMMON_ROUTING_TOKENS,
  IMMUTABLE_TESTNET_RPC_URL,
  MAX_SECONDARY_FEE_BASIS_POINTS,
  TIMX_IMMUTABLE_TESTNET,
} from '../constants';

export type ExchangeContracts = {
  multicall: string;
  coreFactory: string;
  quoterV2: string;
  peripheryRouter: string;
  secondaryFee: string;
};

export const CONTRACTS_FOR_CHAIN_ID: Record<number, ExchangeContracts> = {
  [IMMUTABLE_TESTNET_CHAIN_ID]: {
    multicall: '0xD17c98b38bA28c7eA1080317EB9AB2b9663BEd92',
    coreFactory: '0x8AC26EfCbf5D700b37A27aA00E6934e6904e7B8e',
    quoterV2: '0x0Afe6F5f4DC34461A801420634239FFaD50A2e44',
    peripheryRouter: '0x57c73281f2697a632AEF1A48CD6ff600f49ee344',
    secondaryFee: '0x5893A5c7bc615Dfd36D7383366d00FFFca5f7178',
  },
};

export const SUPPORTED_SANDBOX_CHAINS: Record<number, Chain> = {
  [IMMUTABLE_TESTNET_CHAIN_ID]: {
    chainId: IMMUTABLE_TESTNET_CHAIN_ID,
    rpcUrl: IMMUTABLE_TESTNET_RPC_URL,
    contracts: CONTRACTS_FOR_CHAIN_ID[IMMUTABLE_TESTNET_CHAIN_ID],
    commonRoutingTokens: IMMUTABLE_TESTNET_COMMON_ROUTING_TOKENS,
    nativeToken: TIMX_IMMUTABLE_TESTNET, // TODO: TP-1649: Change to Native when ready.
    wrappedNativeToken: TIMX_IMMUTABLE_TESTNET, // TODO: TP-1649: Change to WIMX when ready.
  },
};

export const SUPPORTED_PRODUCTION_CHAINS: Record<number, Chain> = {};

export const SUPPORTED_CHAIN_IDS_FOR_ENVIRONMENT: Record<Environment, Record<number, Chain>> = {
  [Environment.SANDBOX]: SUPPORTED_SANDBOX_CHAINS,
  [Environment.PRODUCTION]: SUPPORTED_PRODUCTION_CHAINS,
};

function validateOverrides(overrides: ExchangeOverrides) {
  const keysToCheck = ['rpcURL', 'exchangeContracts', 'commonRoutingTokens', 'nativeToken'] as const;
  for (const key of keysToCheck) {
    if (!overrides[key]) {
      throw new InvalidConfigurationError(`Missing override: ${key}`);
    }
  }

  Object.entries(overrides.exchangeContracts).forEach(([key, contract]) => {
    if (!isValidNonZeroAddress(contract)) {
      throw new InvalidConfigurationError(`Invalid exchange contract address for ${key}`);
    }
  });
}

function validateSecondaryFees(secondaryFees: SecondaryFee[]) {
  let totalSecondaryFeeBasisPoints = 0;

  for (const secondaryFee of secondaryFees) {
    if (!isValidNonZeroAddress(secondaryFee.recipient)) {
      throw new InvalidConfigurationError(`Invalid secondary fee recipient address: ${secondaryFee.recipient}`);
    }
    if (secondaryFee.basisPoints <= 0 || secondaryFee.basisPoints > MAX_SECONDARY_FEE_BASIS_POINTS) {
      throw new InvalidConfigurationError(`Invalid secondary fee basis points: ${secondaryFee.basisPoints}`);
    }

    totalSecondaryFeeBasisPoints += secondaryFee.basisPoints;
  }

  if (totalSecondaryFeeBasisPoints > MAX_SECONDARY_FEE_BASIS_POINTS) {
    throw new InvalidConfigurationError(`Invalid total secondary fee basis points: ${totalSecondaryFeeBasisPoints}`);
  }
}

/**
 * {@link ExchangeConfiguration} is used to configure the {@link Exchange} class.
 * @param chainId the ID of the chain to configure. {@link SUPPORTED_CHAIN_IDS_FOR_ENVIRONMENT} contains the supported chains for each environment.
 * @param baseConfig the base {@link ImmutableConfiguration} for the {@link Exchange} class
 * @param secondaryFees an optional array of {@link SecondaryFee}s to apply to all transactions. Total secondary fees must be less than {@link MAX_SECONDARY_FEE_BASIS_POINTS}.
 */
export class ExchangeConfiguration {
  public baseConfig: ImmutableConfiguration;

  public chain: Chain;

  public secondaryFees: SecondaryFee[] = [];

  constructor({
    chainId, baseConfig, secondaryFees, overrides,
  }: ExchangeModuleConfiguration) {
    this.baseConfig = baseConfig;
    this.secondaryFees = secondaryFees || [];

    validateSecondaryFees(this.secondaryFees);

    if (overrides) {
      validateOverrides(overrides);
      this.chain = {
        chainId,
        rpcUrl: overrides.rpcURL,
        contracts: overrides.exchangeContracts,
        commonRoutingTokens: overrides.commonRoutingTokens,
        nativeToken: overrides.nativeToken,
        wrappedNativeToken: overrides.wrappedNativeToken,
      };

      this.secondaryFees = secondaryFees || [];

      return;
    }

    const chain = SUPPORTED_CHAIN_IDS_FOR_ENVIRONMENT[baseConfig.environment][chainId];
    if (!chain) {
      throw new ChainNotSupportedError(chainId, baseConfig.environment);
    }

    this.chain = chain;
  }
}
