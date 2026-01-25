import { Auth, IAuthConfiguration } from '@imtbl/auth';
import { SequenceSigner } from './types';
import { IdentityInstrumentSigner } from './identityInstrumentSigner';
import { PrivateKeySigner } from './privateKeySigner';

export type { SequenceSigner } from './types';
export { IdentityInstrumentSigner } from './identityInstrumentSigner';
export type { IdentityInstrumentSignerConfig } from './identityInstrumentSigner';
export { PrivateKeySigner } from './privateKeySigner';

const DEV_AUTH_DOMAIN = 'https://auth.dev.immutable.com';

export interface CreateSequenceSignerConfig {
  /** Identity Instrument endpoint (required for prod/sandbox) */
  identityInstrumentEndpoint?: string;
}

/**
 * Create the appropriate signer based on environment.
 * - Dev environment (behind VPN): uses PrivateKeySigner
 * - Prod/Sandbox: uses IdentityInstrumentSigner
 *
 * @param auth - Auth instance
 * @param authConfig - Auth configuration (to determine environment)
 * @param config - Signer configuration
 */
export function createSequenceSigner(
  auth: Auth,
  authConfig: IAuthConfiguration,
  config: CreateSequenceSignerConfig = {},
): SequenceSigner {
  const isDevEnvironment = authConfig.authenticationDomain === DEV_AUTH_DOMAIN;

  if (isDevEnvironment) {
    return new PrivateKeySigner(auth);
  }

  if (!config.identityInstrumentEndpoint) {
    throw new Error('identityInstrumentEndpoint is required for non-dev environments');
  }

  return new IdentityInstrumentSigner(auth, {
    identityInstrumentEndpoint: config.identityInstrumentEndpoint,
  });
}
