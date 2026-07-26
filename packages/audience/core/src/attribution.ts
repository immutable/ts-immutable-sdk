const UTM_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

const CLICK_ID_PARAMS = [
  'gclid',
  'dclid',
  'fbclid',
  'ttclid',
  'rdt_cid',
  'msclkid',
  'li_fat_id',
  'twclid',
] as const;

const STORAGE_KEY = '__imtbl_attribution';

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  dclid?: string;
  fbclid?: string;
  ttclid?: string;
  rdt_cid?: string;
  msclkid?: string;
  li_fat_id?: string;
  twclid?: string;
  referral_code?: string;
  referrer?: string;
  landing_page?: string;
  touchpoint_type?: string;
}

type AttributionKey = keyof Attribution;

function parseParams(url: string): Attribution {
  let params: URLSearchParams;
  try {
    params = new URL(url).searchParams;
  } catch {
    return {};
  }

  const result: Attribution = {};
  for (const key of [...UTM_PARAMS, ...CLICK_ID_PARAMS]) {
    const value = params.get(key);
    if (value) {
      result[key as AttributionKey] = value;
    }
  }

  const referralCode = params.get('referral_code');
  if (referralCode) {
    result.referral_code = referralCode;
  }

  return result;
}

function loadFromStorage(): Attribution | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

function saveToStorage(attribution: Attribution): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // sessionStorage may be unavailable (private browsing, storage full)
  }
}

function buildAttribution(): Attribution {
  const urlParams = typeof window !== 'undefined' && window.location
    ? parseParams(window.location.href)
    : {};

  const referrer = typeof document !== 'undefined' ? document.referrer || undefined : undefined;

  const hasClickId = CLICK_ID_PARAMS.some((key) => key in urlParams);
  const hasUtm = UTM_PARAMS.some((key) => key in urlParams);

  return {
    ...urlParams,
    referrer,
    touchpoint_type: hasClickId || hasUtm ? 'click' : undefined,
  };
}

export function collectSessionAttribution(): Attribution {
  const cached = loadFromStorage();
  if (cached) return cached;

  const landingPage = typeof window !== 'undefined' && window.location
    ? window.location.href
    : undefined;

  const attribution: Attribution = {
    ...buildAttribution(),
    landing_page: landingPage,
  };

  saveToStorage(attribution);
  return attribution;
}

/**
 * Parse attribution from the current URL without reading or writing
 * sessionStorage. Returns the UTM / click-ID params on the URL right
 * now, not the ones cached at session start.
 */
export function collectPageAttribution(): Attribution {
  return buildAttribution();
}

export function clearAttribution(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}

/**
 * The ad network a visit is attributed to, derived from `utm_source` and
 * ad-network click IDs on the current URL. Mirrors the network taxonomy
 * used by Immutable's server-side attribution pipeline so client- and
 * server-classified traffic agree on the same names.
 */
export type AttributionNetwork = 'meta' | 'tiktok' | 'google' | 'reddit' | 'x' | 'organic' | 'other';

const META_SOURCES = ['facebook', 'instagram', 'meta', 'fb', 'ig'];
const X_SOURCES = ['x', 'twitter'];

/**
 * Classifies the current page load's traffic source from `utm_source` and
 * ad-network click IDs on the URL (e.g. `fbclid`, `ttclid`, `gclid`).
 *
 * @returns The matched network, `'organic'` when no UTM or click ID is
 * present, or `'other'` when a recognised click ID (e.g. `msclkid`,
 * `li_fat_id`) doesn't map to a named network.
 * @example
 * // https://example.com/?utm_source=facebook
 * getAttributionNetwork(); // 'meta'
 */
export function getAttributionNetwork(): AttributionNetwork {
  if (typeof window === 'undefined' || !window.location) return 'organic';

  const params = new URLSearchParams(window.location.search);
  const source = params.get('utm_source')?.toLowerCase();

  if (META_SOURCES.includes(source ?? '') || params.has('fbclid')) {
    return 'meta';
  }
  if (source === 'tiktok' || params.has('ttclid')) {
    return 'tiktok';
  }
  if (source === 'google' || params.has('gclid') || params.has('dclid')) {
    return 'google';
  }
  if (source === 'reddit' || params.has('rdt_cid')) {
    return 'reddit';
  }
  if (X_SOURCES.includes(source ?? '') || params.has('twclid')) {
    return 'x';
  }
  if (params.has('msclkid') || params.has('li_fat_id')) {
    return 'other';
  }
  return 'organic';
}

/** @returns Whether the current visit is attributed to paid Meta (Facebook/Instagram) traffic. */
export function isPaidMeta(): boolean {
  return getAttributionNetwork() === 'meta';
}

/** @returns Whether the current visit is attributed to paid TikTok traffic. */
export function isPaidTikTok(): boolean {
  return getAttributionNetwork() === 'tiktok';
}

/** @returns Whether the current visit is attributed to paid Google traffic. */
export function isPaidGoogle(): boolean {
  return getAttributionNetwork() === 'google';
}

/** @returns Whether the current visit is attributed to paid Reddit traffic. */
export function isPaidReddit(): boolean {
  return getAttributionNetwork() === 'reddit';
}

/** @returns Whether the current visit is attributed to paid X (Twitter) traffic. */
export function isPaidX(): boolean {
  return getAttributionNetwork() === 'x';
}
