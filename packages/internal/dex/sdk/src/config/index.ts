import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { ChainNotSupportedError, InvalidConfigurationError } from 'errors';
import { isValidNonZeroAddress } from 'lib';
import { ExchangeContracts, ExchangeModuleConfiguration, ExchangeOverrides, SecondaryFee, Chain } from '../types';
import {
  IMMUTABLE_TESTNET_CHAIN_ID,
  IMMUTABLE_TESTNET_COMMON_ROUTING_TOKENS,
  IMMUTABLE_TESTNET_RPC_URL,
  MAX_SECONDARY_FEE_BASIS_POINTS,
  WIMX_IMMUTABLE_TESTNET,
  NATIVE_IMX_IMMUTABLE_TESTNET,
} from '../constants';

export const CONTRACTS_FOR_CHAIN_ID: Record<number, ExchangeContracts> = {
  [IMMUTABLE_TESTNET_CHAIN_ID]: {
    multicall: '0x4DB567A44451b27C1fAd7f52e1cDf64b915d62f9',
    coreFactory: '0xb18c44b211065E69844FbA9AE146DA362104AfBf',
    quoterV2: '0x87854A7D4b9BaC3D37f4516A1Ac7F36fB5ad539f',
    peripheryRouter: '0x786ec643F231960D4C1A4E336990F8E7bF8f1277',
    secondaryFee: '0xB07245b7B802c9A13651021A8E010E33eBB31d36',
  },
};

export const SUPPORTED_SANDBOX_CHAINS: Record<number, Chain> = {
  [IMMUTABLE_TESTNET_CHAIN_ID]: {
    chainId: IMMUTABLE_TESTNET_CHAIN_ID,
    rpcUrl: IMMUTABLE_TESTNET_RPC_URL,
    contracts: CONTRACTS_FOR_CHAIN_ID[IMMUTABLE_TESTNET_CHAIN_ID],
    commonRoutingTokens: IMMUTABLE_TESTNET_COMMON_ROUTING_TOKENS,
    nativeToken: NATIVE_IMX_IMMUTABLE_TESTNET,
    wrappedNativeToken: WIMX_IMMUTABLE_TESTNET,
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

  constructor({ chainId, baseConfig, secondaryFees, overrides }: ExchangeModuleConfiguration) {
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
