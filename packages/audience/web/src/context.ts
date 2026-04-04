import type { EventContext } from './types';
import { isBrowser } from './utils';
import { LIBRARY_NAME, LIBRARY_VERSION } from './config';

export function collectContext(): EventContext {
  const ctx: EventContext = {
    library: LIBRARY_NAME,
    libraryVersion: LIBRARY_VERSION,
  };

  if (!isBrowser()) return ctx;

  ctx.userAgent = navigator.userAgent;
  ctx.locale = navigator.language;
  ctx.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  ctx.screen = `${window.screen.width}x${window.screen.height}`;
  ctx.pageUrl = window.location.href;
  ctx.pagePath = window.location.pathname;
  ctx.pageReferrer = document.referrer;
  ctx.pageTitle = document.title;

  return ctx;
}
