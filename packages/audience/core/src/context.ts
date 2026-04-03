import type { EventContext } from './types';
import { isBrowser } from './utils';
import { getSessionId } from './session';

// WARNING: DO NOT CHANGE THE STRING BELOW. IT GETS REPLACED AT BUILD TIME.
const SDK_VERSION = '__SDK_VERSION__';

export function collectContext(): EventContext {
  const context: EventContext = {
    library: '@imtbl/audience',
    libraryVersion: SDK_VERSION,
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
  context.sessionId = getSessionId();

  return context;
}
