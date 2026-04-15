import {
  AudienceError,
  IdentityType,
  canIdentify,
  canTrack,
} from '@imtbl/audience-core';

import { Audience } from './sdk';
import { AudienceEvents } from './events';
import { LIBRARY_VERSION } from './config';

export type ImmutableAudienceGlobal = {
  init: typeof Audience.init;
  AudienceError: typeof AudienceError;
  AudienceEvents: typeof AudienceEvents;
  IdentityType: typeof IdentityType;
  canIdentify: typeof canIdentify;
  canTrack: typeof canTrack;
  version: string;
};

// Fallback for es2018 targets that predate globalThis (Safari < 12.1).
const globalObj = (
  typeof globalThis !== 'undefined' ? globalThis : window
) as unknown as { ImmutableAudience?: ImmutableAudienceGlobal };

if (globalObj.ImmutableAudience) {
  const existingVersion = globalObj.ImmutableAudience.version ?? 'unknown';
  // eslint-disable-next-line no-console
  console.warn(
    `[@imtbl/audience] CDN bundle loaded twice; keeping v${existingVersion}. `
    + 'Remove the old <script> tag to load a different version.',
  );
} else {
  globalObj.ImmutableAudience = {
    init: Audience.init.bind(Audience),
    AudienceError,
    AudienceEvents,
    IdentityType,
    canIdentify,
    canTrack,
    version: LIBRARY_VERSION,
  };
}
