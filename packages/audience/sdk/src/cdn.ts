/**
 * CDN bundle entry point.
 *
 * Side-effect module: importing this file attaches Audience, AudienceError,
 * and IdentityType to `window.ImmutableAudience` so the SDK can be consumed
 * via a <script> tag.
 *
 * DO NOT import this from application code — use `import { Audience } from
 * '@imtbl/audience'` instead. This file exists solely as the entry point
 * for the CDN build (packages/audience/sdk/tsup.cdn.js).
 */

import { AudienceError, IdentityType } from '@imtbl/audience-core';

import { Audience } from './sdk';
import { LIBRARY_VERSION } from './config';

type GlobalShape = {
  Audience: typeof Audience;
  AudienceError: typeof AudienceError;
  IdentityType: typeof IdentityType;
  version: string;
};

// globalThis is ES2020; tsup targets es2018, so provide a runtime fallback
// to `window` for browsers that predate globalThis (Safari < 12.1).
const globalObj = (
  typeof globalThis !== 'undefined' ? globalThis : window
) as unknown as { ImmutableAudience?: GlobalShape };

if (globalObj.ImmutableAudience) {
  // eslint-disable-next-line no-console
  console.warn(
    '[@imtbl/audience] CDN bundle loaded twice; keeping the first instance.',
  );
} else {
  globalObj.ImmutableAudience = {
    Audience,
    AudienceError,
    IdentityType,
    version: LIBRARY_VERSION,
  };
}
