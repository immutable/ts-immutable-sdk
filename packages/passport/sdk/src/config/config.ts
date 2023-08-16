import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { createConfig, MultiRollupAPIConfiguration, multiRollupConfig } from '@imtbl/generated-clients';
import {
  Networks,
  OidcConfiguration,
  PassportModuleConfiguration,
} from '../types';
import { PassportError, PassportErrorType } from '../errors/passportError';

const validateConfiguration = <T>(
  configuration: T,
  requiredKeys: Array<keyof T>,
  prefix?: string,
) => {
  const missingKeys = requiredKeys
    .map((key) => !configuration[key] && key)
    .filter((n) => n)
    .join(', ');
  if (missingKeys !== '') {
    const errorMessage = prefix
      ? `${prefix} - ${missingKeys} cannot be null`
      : `${missingKeys} cannot be null`;
    throw new PassportError(
      errorMessage,
      PassportErrorType.INVALID_CONFIGURATION,
    );
  }
};

export class PassportConfiguration {
  readonly network: Networks;

  readonly authenticationDomain: string;

  readonly passportDomain: string;

  readonly imxPublicApiDomain: string;

  readonly magicPublishableApiKey: string;

  readonly magicProviderId: string;

  readonly oidcConfiguration: OidcConfiguration;

  readonly baseConfig: ImmutableConfiguration;

  readonly zkEvmChainId: string;

  readonly zkEvmRpcUrl: string;

  readonly relayerUrl: string;

  readonly multiRollupConfig: MultiRollupAPIConfiguration;

  readonly crossSdkBridgeEnabled: boolean;

  constructor({
    baseConfig,
    overrides,
    crossSdkBridgeEnabled,
    ...oidcConfiguration
  }: PassportModuleConfiguration) {
    validateConfiguration(oidcConfiguration, [
      'clientId',
      'logoutRedirectUri',
      'redirectUri',
    ]);
    this.oidcConfiguration = oidcConfiguration;
    this.baseConfig = baseConfig;
    this.crossSdkBridgeEnabled = crossSdkBridgeEnabled || false;

    if (overrides) {
      validateConfiguration(
        overrides,
        [
          'network',
          'authenticationDomain',
          'passportDomain',
          'magicPublishableApiKey',
          'magicProviderId',
          'zkEvmRpcUrl',
          'zkEvmChainId',
          'relayerUrl',
          'imxPublicApiDomain',
          'indexerMrBasePath',
          'orderBookMrBasePath',
          'passportMrBasePath',
        ],
        'overrides',
      );
      this.network = overrides.network;
      this.authenticationDomain = overrides.authenticationDomain;
      this.passportDomain = overrides.passportDomain;
      this.imxPublicApiDomain = overrides.imxPublicApiDomain;
      this.magicPublishableApiKey = overrides.magicPublishableApiKey;
      this.magicProviderId = overrides.magicProviderId;
      this.zkEvmRpcUrl = overrides.zkEvmRpcUrl;
      this.zkEvmChainId = overrides.zkEvmChainId;
      this.relayerUrl = overrides.relayerUrl;
      this.multiRollupConfig = {
        indexer: createConfig({
          basePath: overrides.indexerMrBasePath,
        }),
        orderBook: createConfig({
          basePath: overrides.orderBookMrBasePath,
        }),
        passport: createConfig({
          basePath: overrides.passportMrBasePath,
        }),
      };
    } else {
      switch (baseConfig.environment) {
        case Environment.PRODUCTION: {
          this.network = Networks.PRODUCTION;
          this.authenticationDomain = 'https://auth.immutable.com';
          this.magicPublishableApiKey = 'pk_live_10F423798A540ED7';
          this.magicProviderId = 'fSMzaRQ4O7p4fttl7pCyGVtJS_G70P8SNsLXtPPGHo0=';
          this.passportDomain = 'https://passport.immutable.com';
          this.imxPublicApiDomain = 'https://api.immutable.com';
          this.zkEvmRpcUrl = ''; // TODO: ID-785 Update once mainnet has been deployed
          this.zkEvmChainId = ''; // TODO: ID-785 Update once mainnet has been deployed
          this.relayerUrl = 'https://api.immutable.com/relayer-mr';
          this.multiRollupConfig = multiRollupConfig.getProduction();
          break;
        }
        case Environment.SANDBOX:
        default: {
          this.network = Networks.SANDBOX;
          this.authenticationDomain = 'https://auth.immutable.com';
          this.magicPublishableApiKey = 'pk_live_10F423798A540ED7';
          this.magicProviderId = 'fSMzaRQ4O7p4fttl7pCyGVtJS_G70P8SNsLXtPPGHo0=';
          this.passportDomain = 'https://passport.sandbox.immutable.com';
          this.imxPublicApiDomain = 'https://api.sandbox.immutable.com';
          this.zkEvmRpcUrl = 'https://rpc.testnet.immutable.com';
          this.zkEvmChainId = 'eip155:13472';
          this.relayerUrl = 'https://api.sandbox.immutable.com/relayer-mr';
          this.multiRollupConfig = multiRollupConfig.getSandbox();
          break;
        }
      }
    }
  }
}
