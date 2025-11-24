import {
  OidcConfiguration,
  AuthModuleConfiguration,
  PopupOverlayOptions,
} from './types';
import { PassportError, PassportErrorType } from './errors';

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

/**
 * Interface that any configuration must implement to work with AuthManager
 */
export interface IAuthConfiguration {
  readonly authenticationDomain: string;
  readonly passportDomain: string;
  readonly oidcConfiguration: OidcConfiguration;
  readonly crossSdkBridgeEnabled: boolean;
  readonly popupOverlayOptions?: PopupOverlayOptions;
}

export class AuthConfiguration implements IAuthConfiguration {
  readonly authenticationDomain: string;

  readonly passportDomain: string;

  readonly oidcConfiguration: OidcConfiguration;

  readonly crossSdkBridgeEnabled: boolean;

  readonly popupOverlayOptions?: PopupOverlayOptions;

  constructor({
    authenticationDomain,
    passportDomain,
    crossSdkBridgeEnabled,
    popupOverlayOptions,
    ...oidcConfiguration
  }: AuthModuleConfiguration) {
    validateConfiguration(oidcConfiguration, [
      'clientId',
      'redirectUri',
    ]);

    this.oidcConfiguration = oidcConfiguration;
    this.crossSdkBridgeEnabled = crossSdkBridgeEnabled || false;
    this.popupOverlayOptions = popupOverlayOptions;

    // Default to production auth domain if not provided
    this.authenticationDomain = authenticationDomain || 'https://auth.immutable.com';
    this.passportDomain = passportDomain || 'https://passport.immutable.com';
  }
}
