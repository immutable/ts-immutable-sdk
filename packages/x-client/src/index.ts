export * from './config';
export { IMXClient, ImmutableX } from './IMXClient';
export * from './exportUtils';
export * as Contracts from './exportContracts';
export * from './types';
/**
 * aliased exports to maintain backwards compatibility
 */
export type { ImxModuleConfiguration as ImxClientModuleConfiguration } from './config';
export {
  generateLegacyStarkPrivateKey as imxClientGenerateLegacyStarkPrivateKey,
  generateLegacyStarkPrivateKeyFromSignature as imxClientGenerateLegacyStarkPrivateKeyFromSignature,
  createStarkSigner as imxClientCreateStarkSigner,
  DEFAULT_SIGNATURE_MESSAGE,
} from './exportUtils';
export type { WalletConnection as ImxClientWalletConnection } from './types';
