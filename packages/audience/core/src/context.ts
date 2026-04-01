import type { EventContext } from './types';
import { isBrowser } from './utils';

// Replaced at build time by tsup define config.
const SDK_VERSION = '__SDK_VERSION__';

export function collectContext(library: string): EventContext {
  const ctx: EventContext = {
    library,
    libraryVersion: SDK_VERSION,
  };

  if (!isBrowser()) return ctx;

  ctx.userAgent = navigator.userAgent;
  ctx.locale = navigator.language;
  ctx.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  ctx.screen = `${screen.width}x${screen.height}`;
  ctx.pageUrl = location.href;
  ctx.pagePath = location.pathname;
  ctx.pageReferrer = document.referrer;
  ctx.pageTitle = document.title;

  return ctx;
}

/** Extracts UTM parameters from the current page URL. */
export function collectUtmParams(): Record<string, string> {
  if (!isBrowser()) return {};

  const params = new URLSearchParams(location.search);
  const utms: Record<string, string> = {};

  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const value = params.get(key);
    if (value) utms[key] = value;
  }

  return utms;
}

/** Collects page properties for page events (URL, referrer, title, UTMs). */
export function collectPageProperties(): Record<string, unknown> {
  if (!isBrowser()) return {};

  return {
    url: location.href,
    path: location.pathname,
    referrer: document.referrer,
    title: document.title,
    ...collectUtmParams(),
  };
}
