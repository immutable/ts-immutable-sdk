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
export type AttributionNetwork =
  | 'meta'
  | 'tiktok'
  | 'google'
  | 'reddit'
  | 'x'
  | 'amazon'
  | 'organic'
  | 'other';

/**
 * `utm_source` values only ever used for paid campaigns, classified on source
 * alone (no paid-medium gate). These platforms don't emit a traditional click
 * ID, so the UTM value is the only paid signal they carry (e.g. Amazon ships
 * `utm_source=amazon_ads` with `utm_medium=amazon`).
 */
const DEDICATED_PAID_SOURCES: Record<string, AttributionNetwork> = {
  amazon_ads: 'amazon',
  adwords: 'google',
  ironsource: 'other',
};

/**
 * `utm_source` values that also carry organic traffic (e.g. a shared Facebook
 * post), so a match requires a corroborating paid `utm_medium` before the
 * visit is treated as paid; otherwise organic shares get misclassified.
 */
const GATED_PAID_SOURCES: Record<string, AttributionNetwork> = {
  facebook: 'meta',
  fb: 'meta',
  meta: 'meta',
  instagram: 'meta',
  ig: 'meta',
  tiktok: 'tiktok',
  google: 'google',
  youtube: 'google',
  reddit: 'reddit',
  x: 'x',
  twitter: 'x',
  linkedin: 'other',
};

/**
 * `utm_medium` values that corroborate paid intent for {@link GATED_PAID_SOURCES}.
 * Performance Max variants (`pmax_cpc`, `pmax_cpa`, ...) are matched by prefix
 * in {@link isPaidMedium}.
 */
const PAID_MEDIUMS = [
  'paid',
  'paid_social',
  'paidsocial',
  'cpc',
  'cpm',
  'ppc',
  'ads',
  'sponsored_post',
];

function isPaidMedium(medium: string | undefined): boolean {
  const value = medium ?? '';
  return PAID_MEDIUMS.includes(value) || value.startsWith('pmax');
}

/**
 * Classify from `utm_source` / `utm_medium` when no ad-network click ID is
 * present. Dedicated sources classify on source alone; gated sources require a
 * paid medium. Returns `undefined` when the source doesn't map to a paid
 * network, letting the caller fall through to `organic`.
 */
function networkFromUtm(source: string | undefined, medium: string | undefined): AttributionNetwork | undefined {
  if (!source) return undefined;
  const dedicated = DEDICATED_PAID_SOURCES[source];
  if (dedicated) return dedicated;
  const gated = GATED_PAID_SOURCES[source];
  if (gated && isPaidMedium(medium)) return gated;
  return undefined;
}

/**
 * Shared classifier for {@link getAttributionNetwork}. `source` / `medium`
 * are expected pre-lowercased; `hasParam` reports whether a given click-ID
 * key is present, letting the same logic run against a URL or an
 * {@link Attribution} snapshot. Click IDs are the strongest signal and take
 * precedence over UTM, matching the server-side matcher's ordering.
 */
function classifyNetwork(
  source: string | undefined,
  medium: string | undefined,
  hasParam: (key: AttributionKey) => boolean,
): AttributionNetwork {
  if (hasParam('fbclid')) return 'meta';
  if (hasParam('ttclid')) return 'tiktok';
  if (hasParam('gclid') || hasParam('dclid')) return 'google';
  if (hasParam('rdt_cid')) return 'reddit';
  if (hasParam('twclid')) return 'x';
  if (hasParam('msclkid') || hasParam('li_fat_id')) return 'other';
  return networkFromUtm(source, medium) ?? 'organic';
}

/**
 * Classifies a visit's traffic source from `utm_source` / `utm_medium` and
 * ad-network click IDs (e.g. `fbclid`, `ttclid`, `gclid`). A network click ID
 * is treated as paid on its own; a bare `utm_source` match additionally
 * requires `utm_medium` to be a paid value (see {@link PAID_MEDIUMS}), so
 * organic traffic tagged with e.g. `utm_source=facebook&utm_medium=organic`
 * isn't misclassified as paid.
 *
 * @param attribution When provided, classifies from this snapshot. Pass the
 * session-cached first-touch attribution (the same signals that ride on
 * `sign_up` events and drive server-side attribution) so client- and
 * server-classified traffic agree, even after the landing URL's query params
 * are gone. When omitted, reads the current `window.location` — use this
 * standalone form only where no {@link Audience} instance exists (e.g. a page
 * with just an ad pixel); when you have an instance, prefer
 * `Audience.getAttributionNetwork()`, which classifies from its cached snapshot.
 * @returns The matched network, `'organic'` when no paid signal is present, or
 * `'other'` when the signal is recognised but doesn't map to a named network
 * (e.g. `msclkid` / `li_fat_id`, or a source like `ironsource`/`linkedin` with
 * no first-class network of its own).
 */
export function getAttributionNetwork(attribution?: Attribution): AttributionNetwork {
  if (attribution) {
    return classifyNetwork(
      attribution.utm_source?.toLowerCase(),
      attribution.utm_medium?.toLowerCase(),
      (key) => {
        const value = attribution[key];
        return value != null && value !== '';
      },
    );
  }

  if (typeof window === 'undefined' || !window.location) return 'organic';

  const params = new URLSearchParams(window.location.search);
  return classifyNetwork(
    params.get('utm_source')?.toLowerCase(),
    params.get('utm_medium')?.toLowerCase(),
    (key) => params.has(key),
  );
}
