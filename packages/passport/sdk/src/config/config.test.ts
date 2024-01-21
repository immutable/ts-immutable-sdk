import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { ImmutableXClient } from '@imtbl/x-client';
import { PassportConfiguration } from './config';
import { PassportError, PassportErrorType } from '../errors/passportError';
import {
  PassportOverrides,
  PassportModuleConfiguration,
} from '../types';

describe('Config', () => {
  const oidcConfiguration = {
    clientId: 'client123',
    redirectUri: 'redirect123',
    logoutRedirectUri: 'logout123',
    scope: 'email profile',
    audience: 'xxx_api',
  };

  const overrides: PassportOverrides = {
    authenticationDomain: 'authenticationDomain123',
    imxPublicApiDomain: 'guardianDomain123',
    magicProviderId: 'providerId123',
    magicPublishableApiKey: 'publishableKey123',
    passportDomain: 'customDomain123',
    zkEvmRpcUrl: 'rpcUrl123',
    relayerUrl: 'relayerUrl123',
    immutableXClient: {} as ImmutableXClient,
    indexerMrBasePath: 'indexerMrBasePath123',
    orderBookMrBasePath: 'orderBookMrBasePath123',
    passportMrBasePath: 'passportMrBasePath123',
  };

  describe('when the baseConfig environment is SANDBOX', () => {
    it('returns a Config', () => {
      const immutableConfig = new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      });
      const config = new PassportConfiguration({
        baseConfig: immutableConfig,
        ...oidcConfiguration,
      });
      expect(config).toEqual(
        expect.objectContaining({
          authenticationDomain: 'https://auth.immutable.com',
          magicPublishableApiKey: 'pk_live_10F423798A540ED7',
          magicProviderId: 'fSMzaRQ4O7p4fttl7pCyGVtJS_G70P8SNsLXtPPGHo0=',
          passportDomain: 'https://passport.sandbox.immutable.com',
          oidcConfiguration,
        }),
      );
    });
  });

  describe('when the baseConfig environment is PRODUCTION', () => {
    it('returns a Config', () => {
      const immutableConfig = new ImmutableConfiguration({
        environment: Environment.PRODUCTION,
      });
      const config = new PassportConfiguration({
        baseConfig: immutableConfig,
        ...oidcConfiguration,
      });
      expect(config).toEqual(
        expect.objectContaining({
          authenticationDomain: 'https://auth.immutable.com',
          magicPublishableApiKey: 'pk_live_10F423798A540ED7',
          magicProviderId: 'fSMzaRQ4O7p4fttl7pCyGVtJS_G70P8SNsLXtPPGHo0=',
          passportDomain: 'https://passport.immutable.com',
          oidcConfiguration,
        }),
      );
    });
  });

  describe('when overrides is specified', () => {
    describe('and all keys are specified', () => {
      it('returns a Config', () => {
        const immutableConfig = new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        });
        const config = new PassportConfiguration({
          baseConfig: immutableConfig,
          overrides,
          ...oidcConfiguration,
        });
        expect(config).toEqual(
          expect.objectContaining({
            baseConfig: immutableConfig,
            authenticationDomain: overrides.authenticationDomain,
            magicProviderId: overrides.magicProviderId,
            magicPublishableApiKey: overrides.magicPublishableApiKey,
            passportDomain: overrides.passportDomain,
            oidcConfiguration,
          }),
        );
      });
    });

    describe('and a key is missing', () => {
      it('throws an error', () => {
        const immutableConfig = new ImmutableConfiguration({
          environment: Environment.SANDBOX,
        });
        const passportConfiguration = {
          baseConfig: immutableConfig,
          overrides: {
            ...overrides,
            authenticationDomain: undefined,
          },
          ...oidcConfiguration,
        };
        expect(
          () => new PassportConfiguration(
            passportConfiguration as unknown as PassportModuleConfiguration,
          ),
        ).toThrow(
          new PassportError(
            'overrides - authenticationDomain cannot be null',
            PassportErrorType.AUTHENTICATION_ERROR,
          ),
        );
      });
    });
  });

  describe('when an oidcConfiguration key is missing', () => {
    it('throws an error', () => {
      const immutableConfig = new ImmutableConfiguration({
        environment: Environment.SANDBOX,
      });
      const passportConfiguration = {
        baseConfig: immutableConfig,
        ...oidcConfiguration,
        clientId: undefined,
      };
      expect(
        () => new PassportConfiguration(
          passportConfiguration as unknown as PassportModuleConfiguration,
        ),
      ).toThrow(
        new PassportError(
          'clientId cannot be null',
          PassportErrorType.AUTHENTICATION_ERROR,
        ),
      );
    });
  });
});
