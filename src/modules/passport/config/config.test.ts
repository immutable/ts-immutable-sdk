import {Config, Networks, PassportConfiguration, ValidateConfig} from './config';
import { PassportError, PassportErrorType } from '../errors/passportError';
import { PassportConfigurationArguments } from '../types';

describe('Config', () => {
  describe('createProductionConfig', () => {
    it('should return the correct config', () => {
      const passportArguments: PassportConfigurationArguments = {
        clientId: 'client123',
        redirectUri: 'redirect123',
        logoutRedirectUri: 'logout123',
      };
      expect(Config.createProductionConfig(passportArguments)).toMatchObject({
        network: Networks.PRODUCTION,
        oidcConfiguration: {
          clientId: passportArguments.clientId,
          redirectUri: passportArguments.redirectUri,
          logoutRedirectUri: passportArguments.logoutRedirectUri,
        },
      });
    });
  });
  describe('createSandboxConfig', () => {
    it('should return the correct config', () => {
      const passportArguments: PassportConfigurationArguments = {
        clientId: 'client123',
        redirectUri: 'redirect123',
        logoutRedirectUri: 'logout123',
      };
      expect(Config.createSandboxConfig(passportArguments)).toMatchObject({
        network: Networks.SANDBOX,
        oidcConfiguration: {
          clientId: passportArguments.clientId,
          redirectUri: passportArguments.redirectUri,
          logoutRedirectUri: passportArguments.logoutRedirectUri,
        },
      });
    });
  });
  describe('validateConfig', () => {
    it('should throw a passport error if the required configuration is missing', () => {
      expect(() => ValidateConfig({} as unknown as PassportConfiguration)).toThrowError(
        new PassportError(
          'clientId, redirectUri cannot be null',
          PassportErrorType.INVALID_CONFIGURATION
        )
      );
    });
  });
});
