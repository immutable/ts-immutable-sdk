export * from './config';
export { IMXClient, ImmutableX } from './IMXClient';
export * from './exportUtils';
export * as Contracts from './exportContracts';
export * from './types';
/**
 * aliased exports to maintain backwards compatibility
 */
export { ImxModuleConfiguration as ImxClientModuleConfiguration } from './config';
export {
  generateLegacyStarkPrivateKey as imxClientGenerateLegacyStarkPrivateKey,
  createStarkSigner as imxClientCreateStarkSigner,
} from './exportUtils';
export { WalletConnection as ImxClientWalletConnection } from './types';
