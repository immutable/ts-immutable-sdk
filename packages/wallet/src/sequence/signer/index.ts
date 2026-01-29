import { SequenceSigner } from './types';
import { IdentityInstrumentSigner } from './identityInstrumentSigner';
import { PrivateKeySigner } from './privateKeySigner';
import { GetUserFunction } from '../../types';

export type { SequenceSigner } from './types';
export { IdentityInstrumentSigner } from './identityInstrumentSigner';
export type { IdentityInstrumentSignerConfig } from './identityInstrumentSigner';
export { PrivateKeySigner } from './privateKeySigner';

export interface CreateSequenceSignerConfig {
  /** Identity Instrument endpoint (required for prod/sandbox) */
  identityInstrumentEndpoint?: string;
  /** Whether this is a dev environment (uses PrivateKeySigner instead of IdentityInstrumentSigner) */
  isDevEnvironment?: boolean;
}

/**
 * Create the appropriate signer based on environment.
 * - Dev environment (behind VPN): uses PrivateKeySigner
 * - Prod/Sandbox: uses IdentityInstrumentSigner
 *
 * @param getUser - Function to get the current user
 * @param config - Signer configuration
 */
export function createSequenceSigner(
  getUser: GetUserFunction,
  config: CreateSequenceSignerConfig = {},
): SequenceSigner {
  if (config.isDevEnvironment) {
    return new PrivateKeySigner(getUser);
  }

  if (!config.identityInstrumentEndpoint) {
    throw new Error('identityInstrumentEndpoint is required for non-dev environments');
  }

  return new IdentityInstrumentSigner(getUser, {
    identityInstrumentEndpoint: config.identityInstrumentEndpoint,
  });
}
