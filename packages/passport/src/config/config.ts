import { Environment } from '@imtbl/config';
import { Networks, OidcConfiguration, PassportConfiguration } from '../types';
import { PassportError, PassportErrorType } from '../errors/passportError';

const validateConfiguration = <T>(
  configurationName: string,
  configuration: T,
  requiredKeys: Array<keyof T>
) => {
  if (!configuration) {
    throw new PassportError(
      `${configurationName} cannot be null`,
      PassportErrorType.INVALID_CONFIGURATION
    );
  }

  const missingKeys = requiredKeys
    .map((key) => !configuration[key] && key)
    .filter((n) => n)
    .join(', ');
  if (missingKeys !== '') {
    throw new PassportError(
      `${configurationName} - ${missingKeys} cannot be null`,
      PassportErrorType.INVALID_CONFIGURATION
    );
  }
};

export class Config {
  readonly network: Networks;
  readonly authenticationDomain: string;
  readonly passportDomain: string;
  readonly magicPublishableApiKey: string;
  readonly magicProviderId: string;
  readonly imxApiBasePath: string;
  readonly oidcConfiguration: OidcConfiguration;

  constructor({
    environment,
    overrides,
    ...oidcConfiguration
  }: PassportConfiguration) {
    validateConfiguration('OidcConfiguration', oidcConfiguration, [
      'clientId',
      'logoutRedirectUri',
      'redirectUri',
    ]);
    this.oidcConfiguration = oidcConfiguration;
    if (overrides) {
      validateConfiguration('overrides', overrides, [
        'network',
        'authenticationDomain',
        'magicPublishableApiKey',
        'magicProviderId',
        'passportDomain',
        'imxApiBasePath',
      ]);

      this.network = overrides.network;
      this.authenticationDomain = overrides.authenticationDomain;
      this.passportDomain = overrides.passportDomain;
      this.magicPublishableApiKey = overrides.magicPublishableApiKey;
      this.magicProviderId = overrides.magicProviderId;
      this.imxApiBasePath = overrides.imxApiBasePath;
    } else {
      switch (environment) {
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
