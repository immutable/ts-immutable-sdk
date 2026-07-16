import { getCookie } from './cookie';

/**
 * Read GA Client ID and Meta Pixel cookies when present.
 * These are set by Google Analytics / Meta Pixel scripts and allow
 * cross-platform identity stitching without requiring full consent.
 */
export function collectThirdPartyIds(): Record<string, string> {
  const ids: Record<string, string> = {};
  const ga = getCookie('_ga');
  if (ga) ids.ga_client_id = ga;
  const fbc = getCookie('_fbc');
  if (fbc) ids.fb_click_id = fbc;
  const fbp = getCookie('_fbp');
  if (fbp) ids.fb_browser_id = fbp;
  return ids;
}
