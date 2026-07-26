export { Audience } from './sdk';
export { AudienceEvents } from './events';
export {
  IdentityType,
  canTrack,
  canIdentify,
  AudienceError,
  getAttributionNetwork,
  isPaidMeta,
  isPaidTikTok,
  isPaidGoogle,
  isPaidReddit,
  isPaidX,
} from '@imtbl/audience-core';
export type { ImmutableAudienceGlobal } from './cdn';
export type { AudienceConfig } from './types';
export type { AudienceErrorCode, AutocaptureOptions, AttributionNetwork } from '@imtbl/audience-core';
export type {
  AchievementType,
  AchievementUnlockedProperties,
  AudienceEventName,
  EmailAcquiredProperties,
  GameLaunchProperties,
  GamePageViewedProperties,
  LinkClickedProperties,
  ProgressionProperties,
  ProgressionStatus,
  PropsFor,
  PurchaseProperties,
  ResourceFlow,
  ResourceProperties,
  SignInProperties,
  SignUpProperties,
  WishlistAddProperties,
  WishlistRemoveProperties,
} from './events';
export type { ConsentLevel, UserTraits } from '@imtbl/audience-core';
