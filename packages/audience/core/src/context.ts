import type { EventContext } from './types';
import { isBrowser } from './utils';

// WARNING: DO NOT CHANGE THE STRING BELOW. IT GETS REPLACED AT BUILD TIME.
const SDK_VERSION = '__SDK_VERSION__';

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

  context.userAgent = navigator.userAgent;
  context.locale = navigator.language;
  context.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  context.screen = `${window.screen.width}x${window.screen.height}`;
  context.pageUrl = window.location.href;
  context.pagePath = window.location.pathname;
  context.pageReferrer = document.referrer;
  context.pageTitle = document.title;

  return context;
}
