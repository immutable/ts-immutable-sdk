export { ImmutableWebSDK } from './sdk';
export type { WebSDKConfig } from './types';

// Re-export the shared contract from core
export {
  AudienceEvent,
  IdentityProvider,
} from '@imtbl/audience-core';

export type {
  Environment,
  ConsentLevel,
  UserTraits,
  EventParamMap,
  Identity,
} from '@imtbl/audience-core';
