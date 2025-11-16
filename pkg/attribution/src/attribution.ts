/**
 * Attribution data extracted from URL parameters and referrer
 */
export interface AttributionData {
  /** Campaign source (e.g., 'google', 'facebook') */
  source?: string;
  /** Campaign medium (e.g., 'cpc', 'email') */
  medium?: string;
  /** Campaign name */
  campaign?: string;
  /** Campaign term (keywords) */
  term?: string;
  /** Campaign content (A/B testing) */
  content?: string;
  /** Referrer URL */
  referrer?: string;
  /** Landing page URL */
  landingPage?: string;
  /** First touch timestamp */
  firstTouchTime?: number;
  /** Last touch timestamp */
  lastTouchTime?: number;
  /** Custom attribution parameters */
  custom?: Record<string, string>;
}

/**
 * Parse URL parameters for attribution data
 */
export function parseAttributionFromUrl(url?: string): AttributionData {
  const urlObj = typeof window !== 'undefined' && !url
    ? new URL(window.location.href)
    : url
      ? new URL(url, typeof window !== 'undefined' ? window.location.origin : 'https://example.com')
      : null;

  if (!urlObj) {
    return {};
  }

  const params = urlObj.searchParams;
  const attribution: AttributionData = {
    landingPage: urlObj.href,
    firstTouchTime: Date.now(),
    lastTouchTime: Date.now(),
    custom: {},
  };

  // Standard UTM parameters
  const utmSource = params.get('utm_source');
  const utmMedium = params.get('utm_medium');
  const utmCampaign = params.get('utm_campaign');
  const utmTerm = params.get('utm_term');
  const utmContent = params.get('utm_content');

  if (utmSource) attribution.source = utmSource;
  if (utmMedium) attribution.medium = utmMedium;
  if (utmCampaign) attribution.campaign = utmCampaign;
  if (utmTerm) attribution.term = utmTerm;
  if (utmContent) attribution.content = utmContent;

  // AppsFlyer parameters (af_*)
  const afSource = params.get('af_source') || params.get('pid');
  const afMedium = params.get('af_medium') || params.get('c');
  const afCampaign = params.get('af_campaign') || params.get('af_c');
  const afAdset = params.get('af_adset') || params.get('af_adset_id');
  const afAd = params.get('af_ad') || params.get('af_ad_id');

  if (afSource && !attribution.source) attribution.source = afSource;
  if (afMedium && !attribution.medium) attribution.medium = afMedium;
  if (afCampaign && !attribution.campaign) attribution.campaign = afCampaign;
  if (afAdset) attribution.custom = { ...attribution.custom, af_adset: afAdset };
  if (afAd) attribution.custom = { ...attribution.custom, af_ad: afAd };

  // Adjust parameters (adjust_*)
  const adjustSource = params.get('adjust_source') || params.get('network');
  const adjustCampaign = params.get('adjust_campaign') || params.get('campaign');
  const adjustAdgroup = params.get('adjust_adgroup') || params.get('adgroup');
  const adjustCreative = params.get('adjust_creative') || params.get('creative');

  if (adjustSource && !attribution.source) attribution.source = adjustSource;
  if (adjustCampaign && !attribution.campaign) attribution.campaign = adjustCampaign;
  if (adjustAdgroup) attribution.custom = { ...attribution.custom, adjust_adgroup: adjustAdgroup };
  if (adjustCreative) attribution.custom = { ...attribution.custom, adjust_creative: adjustCreative };

  // Referrer
  if (typeof document !== 'undefined' && document.referrer) {
    try {
      const referrerUrl = new URL(document.referrer);
      attribution.referrer = referrerUrl.hostname;
    } catch {
      attribution.referrer = document.referrer;
    }
  }

  // Collect any remaining custom parameters
  for (const [key, value] of params.entries()) {
    if (
      !key.startsWith('utm_') &&
      !key.startsWith('af_') &&
      !key.startsWith('adjust_') &&
      key !== 'pid' &&
      key !== 'c' &&
      key !== 'network' &&
      key !== 'campaign' &&
      key !== 'adgroup' &&
      key !== 'creative'
    ) {
      attribution.custom = attribution.custom || {};
      attribution.custom[key] = value;
    }
  }

  return attribution;
}

/**
 * Merge new attribution data with existing data
 */
export function mergeAttributionData(
  existing: AttributionData | null,
  incoming: AttributionData,
): AttributionData {
  if (!existing) {
    return incoming;
  }

  return {
    ...existing,
    // Keep first touch time from existing
    firstTouchTime: existing.firstTouchTime || incoming.firstTouchTime,
    // Update last touch time
    lastTouchTime: incoming.lastTouchTime || Date.now(),
    // Merge custom parameters
    custom: {
      ...existing.custom,
      ...incoming.custom,
    },
    // Prefer existing source/medium/campaign unless incoming has values
    source: incoming.source || existing.source,
    medium: incoming.medium || existing.medium,
    campaign: incoming.campaign || existing.campaign,
    term: incoming.term || existing.term,
    content: incoming.content || existing.content,
  };
}

