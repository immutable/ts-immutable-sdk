import { Config } from './config';
import { PassportError, PassportErrorType } from '../errors/passportError';
import {
  EnvironmentConfiguration,
  Networks,
  PassportConfiguration,
} from '../types';
import { Environment } from '@imtbl/config';

describe('Config', () => {
  const oidcConfiguration = {
    clientId: 'client123',
    redirectUri: 'redirect123',
    logoutRedirectUri: 'logout123',
    scope: 'email profile',
    audience: 'xxx_api',
  };

  const overrides: EnvironmentConfiguration = {
    authenticationDomain: 'authenticationDomain123',
    imxApiBasePath: 'basePath123',
    magicProviderId: 'providerId123',
    magicPublishableApiKey: 'publishableKey123',
    network: Networks.SANDBOX,
    passportDomain: 'customDomain123',
  };

  describe('when the environment is SANDBOX', () => {
    it('returns a Config', () => {
      const config = new Config({
        environment: Environment.SANDBOX,
        ...oidcConfiguration,
      });
      expect(config).toEqual(
        expect.objectContaining({
          network: Networks.SANDBOX,
          authenticationDomain: 'https://auth.immutable.com',
          magicPublishableApiKey: 'pk_live_10F423798A540ED7',
          magicProviderId: 'fSMzaRQ4O7p4fttl7pCyGVtJS_G70P8SNsLXtPPGHo0=',
          passportDomain: 'https://passport.immutable.com',
          imxApiBasePath: 'https://api.x.immutable.com',
          oidcConfiguration,
        })
      );
    });
  });

  describe('when the environment is PRODUCTION', () => {
    it('returns a Config', () => {
      const config = new Config({
        environment: Environment.PRODUCTION,
        ...oidcConfiguration,
      });
      expect(config).toEqual(
        expect.objectContaining({
          network: Networks.PRODUCTION,
          authenticationDomain: 'https://auth.immutable.com',
          magicPublishableApiKey: 'pk_live_10F423798A540ED7',
          magicProviderId: 'fSMzaRQ4O7p4fttl7pCyGVtJS_G70P8SNsLXtPPGHo0=',
          passportDomain: 'https://passport.sandbox.immutable.com',
          imxApiBasePath: 'https://api.sandbox.x.immutable.com',
          oidcConfiguration,
        })
      );
    });
  });

  describe('when overrides is specified', () => {
    describe('and all keys are specified', () => {
      it('returns a Config', () => {
        const config = new Config({
          environment: Environment.SANDBOX,
          overrides,
          ...oidcConfiguration,
        });
        expect(config).toEqual(
          expect.objectContaining({
            ...overrides,
            oidcConfiguration,
          })
        );
      });
    });

    describe('and a key is missing', () => {
      it('throws an error', () => {
        const passportConfiguration = {
          environment: Environment.SANDBOX,
          overrides: {
            ...overrides,
            authenticationDomain: undefined,
          },
          ...oidcConfiguration,
        };
        expect(
          () =>
            new Config(
              passportConfiguration as unknown as PassportConfiguration
            )
        ).toThrow(
          new PassportError(
            'overrides - authenticationDomain cannot be null',
            PassportErrorType.AUTHENTICATION_ERROR
          )
        );
      });
    });
  });

  describe('when an oidcConfiguration key is missing', () => {
    it('throws an error', () => {
      const config = {
        environment: Environment.PRODUCTION,
        ...oidcConfiguration,
        clientId: undefined,
      };
      expect(
        () => new Config(config as unknown as PassportConfiguration)
      ).toThrow(
        new PassportError(
          'OidcConfiguration - clientId cannot be null',
          PassportErrorType.AUTHENTICATION_ERROR
        )
      );
    });
  });
});
