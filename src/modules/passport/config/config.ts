import { PassportConfigurationArguments } from '../types';
import { PassportError, PassportErrorType } from '../errors/passportError';

export enum Networks {
  PRODUCTION = 'mainnet',
  SANDBOX = 'goerli',
}

export interface PassportConfiguration {
  network: Networks,
  oidcConfiguration: {
    authenticationDomain: string
    clientId: string;
    logoutRedirectUri: string;
    redirectUri: string;
  },
  magicPublishableApiKey: string;
  magicProviderId: string;
}

export const Config = {
  createProductionConfig: (passportArguments: PassportConfigurationArguments): PassportConfiguration => ({
    network: Networks.PRODUCTION,
    oidcConfiguration: {
      authenticationDomain: 'https://auth.immutable.com',
      clientId: passportArguments.clientId,
      logoutRedirectUri: passportArguments.logoutRedirectUri,
      redirectUri: passportArguments.redirectUri,
    },
    magicPublishableApiKey: 'pk_live_10F423798A540ED7',
    magicProviderId: 'fSMzaRQ4O7p4fttl7pCyGVtJS_G70P8SNsLXtPPGHo0=',
  }),
  createSandboxConfig: (passportArguments: PassportConfigurationArguments): PassportConfiguration => ({
    network: Networks.SANDBOX,
    oidcConfiguration: {
      authenticationDomain: 'https://auth.dev.immutable.com',
      clientId: passportArguments.clientId,
      logoutRedirectUri: passportArguments.logoutRedirectUri,
      redirectUri: passportArguments.redirectUri,
    },
    magicPublishableApiKey: 'pk_live_4058236363130CA9',
    magicProviderId: 'C9odf7hU4EQ5EufcfgYfcBaT5V6LhocXyiPRhIjw2EY=',
  }),
};

export const ValidateConfig = ({ oidcConfiguration }: PassportConfiguration) => {
  const requiredConfiguration = ['clientId', 'redirectUri'];
  const errorMessage = requiredConfiguration
    .map((key) => !(oidcConfiguration && (oidcConfiguration as Record<string, string>)[key]) && key)
    .filter((n) => n)
    .join(', ');
  if (errorMessage !== '') {
    throw new PassportError(
      `${errorMessage} cannot be null`,
      PassportErrorType.INVALID_CONFIGURATION
    );
  }
}
