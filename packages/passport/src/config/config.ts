import { Environment } from '@imtbl/config';
import {
  Networks,
  OidcConfiguration,
  PassportModuleConfiguration,
} from '../types';
import { PassportError, PassportErrorType } from '../errors/passportError';

const validateConfiguration = <T>(
  configuration: T,
  requiredKeys: Array<keyof T>,
  prefix?: string
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
      PassportErrorType.INVALID_CONFIGURATION
    );
  }
};

export class PassportConfiguration {
  readonly network: Networks;
  readonly authenticationDomain: string;
  readonly passportDomain: string;
  readonly magicPublishableApiKey: string;
  readonly magicProviderId: string;
  readonly imxApiBasePath: string;
  readonly oidcConfiguration: OidcConfiguration;

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
    if (overrides) {
      validateConfiguration(
        overrides,
        [
          'network',
          'authenticationDomain',
          'magicPublishableApiKey',
          'magicProviderId',
          'passportDomain',
          'imxApiBasePath',
        ],
        'overrides'
      );
      this.network = overrides.network;
      this.authenticationDomain = overrides.authenticationDomain;
      this.passportDomain = overrides.passportDomain;
      this.magicPublishableApiKey = overrides.magicPublishableApiKey;
      this.magicProviderId = overrides.magicProviderId;
      this.imxApiBasePath = overrides.imxApiBasePath;
    } else {
      switch (baseConfig.getEnvironment()) {
        case Environment.SANDBOX: {
          this.network = Networks.SANDBOX;
          this.authenticationDomain = 'https://auth.immutable.com';
          this.magicPublishableApiKey = 'pk_live_10F423798A540ED7';
          this.magicProviderId = 'fSMzaRQ4O7p4fttl7pCyGVtJS_G70P8SNsLXtPPGHo0=';
          this.passportDomain = 'https://passport.immutable.com';
          this.imxApiBasePath = 'https://api.x.immutable.com';
          break;
        }
        case Environment.PRODUCTION: {
          this.network = Networks.PRODUCTION;
          this.authenticationDomain = 'https://auth.immutable.com';
          this.magicPublishableApiKey = 'pk_live_10F423798A540ED7';
          this.magicProviderId = 'fSMzaRQ4O7p4fttl7pCyGVtJS_G70P8SNsLXtPPGHo0=';
          this.passportDomain = 'https://passport.sandbox.immutable.com';
          this.imxApiBasePath = 'https://api.sandbox.x.immutable.com';
          break;
        }
      }
    }
  }
}
