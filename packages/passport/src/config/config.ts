import { Environment, ImmutableConfiguration } from '@imtbl/config';
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

  constructor({
    baseConfig,
    overrides,
    ...oidcConfiguration
  }: PassportModuleConfiguration) {
    validateConfiguration(oidcConfiguration, [
      'clientId',
      'logoutRedirectUri',
      'redirectUri',
    ]);
    this.oidcConfiguration = oidcConfiguration;
    this.baseConfig = baseConfig;
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
          this.relayerUrl = 'https://relayer.immutable.com'; // TODO: ID-784 Update once we have added Relayer URL to config
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
          this.zkEvmRpcUrl = 'https://zkevm-rpc.sandbox.x.immutable.com';
          this.zkEvmChainId = '13372';
          this.relayerUrl = 'https://relayer.sandbox.immutable.com'; // TODO: ID-784 Update once we have added Relayer URL to config
          break;
        }
      }
    }
  }
}
