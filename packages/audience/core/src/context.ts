import type { EventContext } from './types';
import { isBrowser } from './utils';
import { truncate } from './validation';

// WARNING: DO NOT CHANGE THE STRING BELOW. IT GETS REPLACED AT BUILD TIME.
const SDK_VERSION = '__SDK_VERSION__';

// Backend maxLength constraints from OAS for EventContext fields.
const MAX_USER_AGENT_LENGTH = 512;
const MAX_PAGE_FIELD_LENGTH = 2048; // pageUrl, pagePath, pageReferrer

/**
 * Collect browser context for event payloads.
 *
 * Callers may pass their own library name and version when multiple surfaces
 * (web SDK, pixel, Unity, Unreal) share this function and each must identify
 * itself. Defaults to '@imtbl/audience' with the build-time SDK version.
 */
export function collectContext(
  library = '@imtbl/audience',
  version = SDK_VERSION,
): EventContext {
  const context: EventContext = {
    library,
    libraryVersion: version,
  };

  if (!isBrowser()) return context;

  context.userAgent = truncate(navigator.userAgent, MAX_USER_AGENT_LENGTH);
  context.locale = truncate(navigator.language);
  context.timezone = truncate(Intl.DateTimeFormat().resolvedOptions().timeZone);
  context.screen = `${window.screen.width}x${window.screen.height}`;
  context.screenDensity = window.devicePixelRatio;
  context.pageUrl = truncate(window.location.href, MAX_PAGE_FIELD_LENGTH);
  context.pagePath = truncate(window.location.pathname, MAX_PAGE_FIELD_LENGTH);
  context.pageReferrer = truncate(document.referrer, MAX_PAGE_FIELD_LENGTH);
  context.pageTitle = truncate(document.title);

  return context;
}
