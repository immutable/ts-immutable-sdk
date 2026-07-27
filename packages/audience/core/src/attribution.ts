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
 * The ad network a visit is attributed to, derived from `utm_source` /
 * `utm_medium` and ad-network click IDs on the current URL. Mirrors the
 * network taxonomy used by Immutable's server-side attribution pipeline
 * so client- and server-classified traffic agree on the same names.
 */
export type AttributionNetwork = 'meta' | 'tiktok' | 'google' | 'reddit' | 'x' | 'organic' | 'other';

const META_SOURCES = ['facebook', 'instagram', 'meta', 'fb', 'ig'];
const X_SOURCES = ['x', 'twitter'];

/**
 * `utm_medium` values that indicate paid traffic. A `utm_source` match
 * alone isn't sufficient to call a visit "paid" — e.g. `utm_source=facebook`
 * also covers an organic post shared on Facebook — so the medium must
 * corroborate paid intent unless a network click ID is present.
 */
const PAID_MEDIUMS = ['cpc', 'ppc', 'paid', 'paid_social', 'paidsocial'];

function isPaidSourceMatch(source: string | undefined, medium: string | undefined, sources: string[]): boolean {
  return sources.includes(source ?? '') && PAID_MEDIUMS.includes(medium ?? '');
}

/**
 * Classifies the current page load's traffic source from `utm_source` /
 * `utm_medium` and ad-network click IDs on the URL (e.g. `fbclid`,
 * `ttclid`, `gclid`). A network click ID is treated as paid on its own;
 * a bare `utm_source` match additionally requires `utm_medium` to be a
 * paid value (see {@link PAID_MEDIUMS}), so organic traffic tagged with
 * e.g. `utm_source=facebook&utm_medium=organic` isn't misclassified as paid.
 *
 * @returns The matched network, `'organic'` when no UTM or click ID is
 * present, or `'other'` when a recognised click ID (e.g. `msclkid`,
 * `li_fat_id`) doesn't map to a named network.
 * @example
 * // https://example.com/?utm_source=facebook&utm_medium=paid_social
 * getAttributionNetwork(); // 'meta'
 * @example
 * // https://example.com/?utm_source=facebook&utm_medium=organic
 * getAttributionNetwork(); // 'organic'
 * @example
 * // https://example.com/?fbclid=abc123
 * getAttributionNetwork(); // 'meta' — click ID alone is a sufficient paid signal
 */
export function getAttributionNetwork(): AttributionNetwork {
  if (typeof window === 'undefined' || !window.location) return 'organic';

  const params = new URLSearchParams(window.location.search);
  const source = params.get('utm_source')?.toLowerCase();
  const medium = params.get('utm_medium')?.toLowerCase();

  if (params.has('fbclid') || isPaidSourceMatch(source, medium, META_SOURCES)) {
    return 'meta';
  }
  if (params.has('ttclid') || isPaidSourceMatch(source, medium, ['tiktok'])) {
    return 'tiktok';
  }
  if (params.has('gclid') || params.has('dclid') || isPaidSourceMatch(source, medium, ['google'])) {
    return 'google';
  }
  if (params.has('rdt_cid') || isPaidSourceMatch(source, medium, ['reddit'])) {
    return 'reddit';
  }
  if (params.has('twclid') || isPaidSourceMatch(source, medium, X_SOURCES)) {
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
