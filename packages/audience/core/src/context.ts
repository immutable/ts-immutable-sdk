import type { EventContext } from './types';
import { isBrowser } from './utils';

/**
 * Collect browser context for event payloads.
 *
 * Callers pass their own library name and version because multiple surfaces
 * (web SDK, pixel, Unity, Unreal) share this function and each must identify
 * itself. Version strings use '__SDK_VERSION__' which the tsup build pipeline
 * replaces at build time via esbuild-plugin-replace.
 */
export function collectContext(library: string, version: string): EventContext {
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
