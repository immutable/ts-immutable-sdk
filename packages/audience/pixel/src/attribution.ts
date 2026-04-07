const UTM_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

const CLICK_ID_PARAMS = [
  'gclid',
  'fbclid',
  'ttclid',
  'msclkid',
] as const;

const STORAGE_KEY = '__imtbl_attribution';

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  fbclid?: string;
  ttclid?: string;
  msclkid?: string;
  referrer?: string;
  landing_page?: string;
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

export function collectAttribution(): Attribution {
  const cached = loadFromStorage();
  if (cached) return cached;

  const urlParams = typeof window !== 'undefined' && window.location
    ? parseParams(window.location.href)
    : {};

  const referrer = typeof document !== 'undefined' ? document.referrer || undefined : undefined;
  const landingPage = typeof window !== 'undefined' && window.location
    ? window.location.href
    : undefined;

  const attribution: Attribution = {
    ...urlParams,
    referrer,
    landing_page: landingPage,
  };

  saveToStorage(attribution);
  return attribution;
}

export function clearAttribution(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}
