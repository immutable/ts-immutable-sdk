import { Config, getPassportConfiguration } from './config';
import { PassportError, PassportErrorType } from '../errors/passportError';
import { EnvironmentConfiguration, OidcConfiguration } from '../types';

describe('Config', () => {
  describe('getPassportConfiguration', () => {
    const oidcConfiguration = {
      clientId: 'client123',
      redirectUri: 'redirect123',
      logoutRedirectUri: 'logout123',
    };

    describe('when both configurations are valid', () => {
      it('returns a PassportConfiguration', () => {
        const passport = getPassportConfiguration(Config.SANDBOX, oidcConfiguration);
        expect(passport).toEqual({
          network: Config.SANDBOX.network,
          oidcConfiguration: {
            authenticationDomain: Config.SANDBOX.authenticationDomain,
            clientId: oidcConfiguration.clientId,
            logoutRedirectUri: oidcConfiguration.logoutRedirectUri,
            redirectUri: oidcConfiguration.redirectUri,
          },
          magicPublishableApiKey: Config.SANDBOX.magicPublishableApiKey,
          magicProviderId: Config.SANDBOX.magicProviderId,
        });
      });
    });
    describe('when the environmentConfiguration is null', () => {
      it('throws an error', () => {
        expect(
          () => getPassportConfiguration(undefined as unknown as EnvironmentConfiguration, oidcConfiguration)
        ).toThrow(
          new PassportError(
            'EnvironmentConfiguration cannot be null',
            PassportErrorType.AUTHENTICATION_ERROR
          )
        );
      });
    });
    describe('when the environmentConfiguration is missing a required value', () => {
      it('throws an error', () => {
        const environmentConfiguration = {
          ...Config.SANDBOX,
          authenticationDomain: undefined,
        } as Partial<EnvironmentConfiguration>;
        expect(() => getPassportConfiguration(environmentConfiguration as EnvironmentConfiguration, oidcConfiguration)).toThrow(
          new PassportError(
            'EnvironmentConfiguration - authenticationDomain cannot be null',
            PassportErrorType.AUTHENTICATION_ERROR
          )
        );
      });
    });
    describe('when the oidcConfiguration is null', () => {
      it('throws an error', () => {
        expect(
          () => getPassportConfiguration(Config.SANDBOX, undefined as unknown as OidcConfiguration)
        ).toThrow(
          new PassportError(
            'OidcConfiguration cannot be null',
            PassportErrorType.AUTHENTICATION_ERROR
          )
        );
      });
    });
    describe('when the oidcConfiguration is missing a required value', () => {
      it('throws an error', () => {
        const invalidOidcConfiguration = {
          ...oidcConfiguration,
          clientId: undefined,
        } as Partial<OidcConfiguration>;
        expect(() => (
          getPassportConfiguration(Config.SANDBOX, invalidOidcConfiguration as OidcConfiguration)
        )).toThrow(
          new PassportError(
            'OidcConfiguration - clientId cannot be null',
            PassportErrorType.AUTHENTICATION_ERROR
          )
        );
      });
    })
  });
});
