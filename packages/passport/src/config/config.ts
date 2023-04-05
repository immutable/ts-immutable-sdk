import {
  EnvironmentConfiguration,
  Networks,
  OidcConfiguration,
} from "../types";
import { PassportError, PassportErrorType } from "../errors/passportError";

export interface ImxApiConfiguration {
  basePath: string;
}

export interface PassportConfiguration {
  network: Networks;
  oidcConfiguration: {
    authenticationDomain: string;
    clientId: string;
    logoutRedirectUri: string;
    redirectUri: string;
  };
  passportDomain: string;
  imxAPIConfiguration: ImxApiConfiguration;
  magicPublishableApiKey: string;
  magicProviderId: string;
}

export const Config = {
  PRODUCTION: {
    network: Networks.PRODUCTION,
    authenticationDomain: "https://auth.immutable.com",
    magicPublishableApiKey: "pk_live_10F423798A540ED7",
    magicProviderId: "fSMzaRQ4O7p4fttl7pCyGVtJS_G70P8SNsLXtPPGHo0=",
    baseIMXApiPath: "https://api.x.immutable.com",
    passportDomain: "https://passport.immutable.com",
  } as EnvironmentConfiguration,
  SANDBOX: {
    network: Networks.SANDBOX,
    authenticationDomain: "https://auth.immutable.com",
    magicPublishableApiKey: "pk_live_10F423798A540ED7",
    magicProviderId: "fSMzaRQ4O7p4fttl7pCyGVtJS_G70P8SNsLXtPPGHo0=",
    baseIMXApiPath: "https://api.sandbox.x.immutable.com",
    passportDomain: "https://passport.sandbox.immutable.com",
  } as EnvironmentConfiguration,
};

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
    .join(", ");
  if (missingKeys !== "") {
    throw new PassportError(
      `${configurationName} - ${missingKeys} cannot be null`,
      PassportErrorType.INVALID_CONFIGURATION
    );
  }
};

export const getPassportConfiguration = (
  environmentConfiguration: EnvironmentConfiguration,
  oidcConfiguration: OidcConfiguration
): PassportConfiguration => {
  validateConfiguration("EnvironmentConfiguration", environmentConfiguration, [
    "network",
    "authenticationDomain",
    "magicPublishableApiKey",
    "magicProviderId",
    "passportDomain",
  ]);
  validateConfiguration("OidcConfiguration", oidcConfiguration, [
    "clientId",
    "logoutRedirectUri",
    "redirectUri",
  ]);

  return {
    network: environmentConfiguration.network,
    oidcConfiguration: {
      authenticationDomain: environmentConfiguration.authenticationDomain,
      clientId: oidcConfiguration.clientId,
      logoutRedirectUri: oidcConfiguration.logoutRedirectUri,
      redirectUri: oidcConfiguration.redirectUri,
    },
    imxAPIConfiguration: {
      basePath: environmentConfiguration.baseIMXApiPath,
    },
    passportDomain: environmentConfiguration.passportDomain,
    magicPublishableApiKey: environmentConfiguration.magicPublishableApiKey,
    magicProviderId: environmentConfiguration.magicProviderId,
  };
};
