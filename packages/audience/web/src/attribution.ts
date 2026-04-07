import { isBrowser } from '@imtbl/audience-core';

/**
 * Attribution signals captured from the landing URL on first page load.
 * Stored in wire format (snake_case) — no intermediate conversion needed.
 * Cached in sessionStorage so SPA navigations don't lose the original params.
 */
export type Attribution = Record<string, string>;

/**
 * URL query parameters to capture as attribution.
 * Keys are the URL param names, values are the wire-format property names.
 * Adding a new tracked param is a single line here.
 */
const TRACKED_PARAMS: Record<string, string> = {
  // UTM campaign parameters (Google Analytics spec)
  utm_source: 'utm_source',
  utm_medium: 'utm_medium',
  utm_campaign: 'utm_campaign',
  utm_content: 'utm_content',
  utm_term: 'utm_term',
  // Ad platform click IDs (at most one per visit)
  gclid: 'gclid',
  fbclid: 'fbclid',
  ttclid: 'ttclid',
  msclkid: 'msclkid',
  dclid: 'dclid',
  li_fat_id: 'li_fat_id',
  // Referral
  ref: 'referral_code',
};

const SESSION_KEY = '__imtbl_attribution';

function getCached(): Attribution | undefined {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function persist(ctx: Attribution): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(ctx));
  } catch {
    // sessionStorage unavailable — attribution won't persist across SPA navigations
  }
}

/**
 * Capture attribution signals from the current URL.
 * Parsed once per session and cached in sessionStorage so SPA
 * route changes don't lose the original landing params.
 */
export function parseAttribution(): Attribution {
  if (!isBrowser()) return {};

  const cached = getCached();
  if (cached) return cached;

  const params = new URLSearchParams(window.location.search);
  const ctx: Attribution = {};

  for (const [param, prop] of Object.entries(TRACKED_PARAMS)) {
    const value = params.get(param);
    if (value) ctx[prop] = value;
  }

  if (document.referrer) ctx.referrer = document.referrer;
  ctx.landing_page = window.location.href;

  persist(ctx);
  return ctx;
}
