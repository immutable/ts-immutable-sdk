import { isBrowser } from './utils';

export interface AttributionContext {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  msclkid?: string;
  referrer?: string;
  landingPage?: string;
}

const SESSION_KEY = '__imtbl_attribution';

function getSessionAttribution(): AttributionContext | undefined {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function persistSessionAttribution(ctx: AttributionContext): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(ctx));
  } catch {
    // sessionStorage unavailable — attribution won't persist across SPA navigations
  }
}

/**
 * Parse attribution signals from the current URL.
 * Captured once per session and persisted in sessionStorage so SPA
 * route changes don't lose the original UTM params.
 */
export function parseAttribution(): AttributionContext {
  if (!isBrowser()) return {};

  // Return cached attribution for this session if it exists
  const cached = getSessionAttribution();
  if (cached) return cached;

  const params = new URLSearchParams(window.location.search);

  const ctx: AttributionContext = {
    utmSource: params.get('utm_source') ?? undefined,
    utmMedium: params.get('utm_medium') ?? undefined,
    utmCampaign: params.get('utm_campaign') ?? undefined,
    utmContent: params.get('utm_content') ?? undefined,
    utmTerm: params.get('utm_term') ?? undefined,
    gclid: params.get('gclid') ?? undefined,
    fbclid: params.get('fbclid') ?? undefined,
    ttclid: params.get('ttclid') ?? undefined,
    msclkid: params.get('msclkid') ?? undefined,
    referrer: document.referrer || undefined,
    landingPage: window.location.href,
  };

  persistSessionAttribution(ctx);
  return ctx;
}

/** Convert attribution context to flat properties for the first PageMessage. */
export function attributionToProperties(ctx: AttributionContext): Record<string, string> {
  const props: Record<string, string> = {};
  if (ctx.utmSource) props.utm_source = ctx.utmSource;
  if (ctx.utmMedium) props.utm_medium = ctx.utmMedium;
  if (ctx.utmCampaign) props.utm_campaign = ctx.utmCampaign;
  if (ctx.utmContent) props.utm_content = ctx.utmContent;
  if (ctx.utmTerm) props.utm_term = ctx.utmTerm;
  if (ctx.gclid) props.gclid = ctx.gclid;
  if (ctx.fbclid) props.fbclid = ctx.fbclid;
  if (ctx.ttclid) props.ttclid = ctx.ttclid;
  if (ctx.msclkid) props.msclkid = ctx.msclkid;
  if (ctx.referrer) props.referrer = ctx.referrer;
  if (ctx.landingPage) props.landing_page = ctx.landingPage;
  return props;
}
