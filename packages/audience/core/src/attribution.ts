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
 * Shared classifier for {@link getAttributionNetwork}. `source` / `medium`
 * are expected pre-lowercased; `hasParam` reports whether a given click-ID
 * key is present, letting the same logic run against a URL or an
 * {@link Attribution} snapshot.
 */
function classifyNetwork(
  source: string | undefined,
  medium: string | undefined,
  hasParam: (key: AttributionKey) => boolean,
): AttributionNetwork {
  if (hasParam('fbclid') || isPaidSourceMatch(source, medium, META_SOURCES)) return 'meta';
  if (hasParam('ttclid') || isPaidSourceMatch(source, medium, ['tiktok'])) return 'tiktok';
  if (hasParam('gclid') || hasParam('dclid') || isPaidSourceMatch(source, medium, ['google'])) return 'google';
  if (hasParam('rdt_cid') || isPaidSourceMatch(source, medium, ['reddit'])) return 'reddit';
  if (hasParam('twclid') || isPaidSourceMatch(source, medium, X_SOURCES)) return 'x';
  if (hasParam('msclkid') || hasParam('li_fat_id')) return 'other';
  return 'organic';
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
 * @returns The matched network, `'organic'` when no UTM or click ID is
 * present, or `'other'` when a recognised click ID (e.g. `msclkid`,
 * `li_fat_id`) doesn't map to a named network.
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
