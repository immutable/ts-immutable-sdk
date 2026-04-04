// Re-export shared event definitions from the core SDK
export { AudienceEvent } from '@imtbl/audience';
export type { EventParamMap } from '@imtbl/audience';

/**
 * Identity providers matching the backend IdentityType enum exactly.
 *
 * Divergence from @imtbl/audience: the shared SDK includes PlayStation, Xbox,
 * and Nintendo which the backend does not accept. The audience web SDK exposes
 * only the 8 values the backend validates. Game-specific providers should use Custom.
 *
 * Named "IdentityProvider" for DX (studios write IdentityProvider.Steam).
 * Wire format uses "identityType" as the field name per the backend schema.
 */
/* eslint-disable @typescript-eslint/no-redeclare */
export const IdentityProvider = {
  Passport: 'passport',
  Steam: 'steam',
  Epic: 'epic',
  Google: 'google',
  Apple: 'apple',
  Discord: 'discord',
  Email: 'email',
  Custom: 'custom',
} as const;

export type IdentityProvider = (typeof IdentityProvider)[keyof typeof IdentityProvider];
/* eslint-enable @typescript-eslint/no-redeclare */

export interface Identity {
  uid: string;
  provider: IdentityProvider;
}
