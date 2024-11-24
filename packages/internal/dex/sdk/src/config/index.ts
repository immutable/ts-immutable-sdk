import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { ChainNotSupportedError, InvalidConfigurationError } from '../errors';
import { isValidNonZeroAddress } from '../lib';
import { ExchangeContracts, ExchangeModuleConfiguration, ExchangeOverrides, SecondaryFee, Chain } from '../types';
import {
  IMMUTABLE_TESTNET_CHAIN_ID,
  IMMUTABLE_TESTNET_COMMON_ROUTING_TOKENS,
  IMMUTABLE_TESTNET_RPC_URL,
  MAX_SECONDARY_FEE_BASIS_POINTS,
  WIMX_IMMUTABLE_TESTNET,
  NATIVE_IMX_IMMUTABLE_TESTNET,
  IMMUTABLE_MAINNET_CHAIN_ID,
  IMMUTABLE_MAINNET_RPC_URL,
  NATIVE_IMX_IMMUTABLE_MAINNET,
  WIMX_IMMUTABLE_MAINNET,
  IMMUTABLE_MAINNET_COMMON_ROUTING_TOKENS,
} from '../constants';

export const CONTRACTS_FOR_CHAIN_ID: Record<number, ExchangeContracts> = {
  [IMMUTABLE_TESTNET_CHAIN_ID]: {
    multicall: '0x4857Dfd11c712e862eC362cEee29F7974B70EfcD',
    coreFactory: '0x56c2162254b0E4417288786eE402c2B41d4e181e',
    quoter: '0xF6Ad3CcF71Abb3E12beCf6b3D2a74C963859ADCd',
    swapRouter: '0x0b012055F770AE7BB7a8303968A7Fb6088A2296e',
    immutableSwapProxy: '0xDdBDa144cEbe1cCd68E746CDff8a6e4Be51A9e98',
  },
  [IMMUTABLE_MAINNET_CHAIN_ID]: {
    multicall: '0xc7efb32470dEE601959B15f1f923e017C6A918cA',
    coreFactory: '0x56c2162254b0E4417288786eE402c2B41d4e181e',
    quoter: '0xF6Ad3CcF71Abb3E12beCf6b3D2a74C963859ADCd',
    swapRouter: '0xE5a02c2Be08406c3fB36F9Aa29bF7C7A09CAe50B',
    immutableSwapProxy: '0xD67cc11151dBccCC424A16F8963ece3D0539BD61',
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

export const SUPPORTED_PRODUCTION_CHAINS: Record<number, Chain> = {
  [IMMUTABLE_MAINNET_CHAIN_ID]: {
    chainId: IMMUTABLE_MAINNET_CHAIN_ID,
    rpcUrl: IMMUTABLE_MAINNET_RPC_URL,
    contracts: CONTRACTS_FOR_CHAIN_ID[IMMUTABLE_MAINNET_CHAIN_ID],
    commonRoutingTokens: IMMUTABLE_MAINNET_COMMON_ROUTING_TOKENS,
    nativeToken: NATIVE_IMX_IMMUTABLE_MAINNET,
    wrappedNativeToken: WIMX_IMMUTABLE_MAINNET,
  },
};

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
