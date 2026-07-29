import {
  collectSessionAttribution,
  collectPageAttribution,
  clearAttribution,
  getAttributionNetwork,
} from './attribution';

const STORAGE_KEY = '__imtbl_attribution';

beforeEach(() => {
  sessionStorage.clear();
  jest.restoreAllMocks();
});

function setLocation(url: string) {
  Object.defineProperty(window, 'location', {
    value: new URL(url),
    writable: true,
    configurable: true,
  });
}

describe('collectSessionAttribution', () => {
  it('parses UTM parameters from the URL', () => {
    setLocation(
      'https://example.com/?utm_source=google&utm_medium=cpc&utm_campaign=spring&utm_content=banner&utm_term=nft',
    );

    const result = collectSessionAttribution();
    expect(result.utm_source).toBe('google');
    expect(result.utm_medium).toBe('cpc');
    expect(result.utm_campaign).toBe('spring');
    expect(result.utm_content).toBe('banner');
    expect(result.utm_term).toBe('nft');
  });

  it('parses ad network click IDs', () => {
    setLocation(
      'https://example.com/?gclid=abc&dclid=dc1&fbclid=fb2&ttclid=tt3'
      + '&rdt_cid=rdt4&msclkid=ms5&li_fat_id=li6&twclid=tw7',
    );

    const result = collectSessionAttribution();
    expect(result.gclid).toBe('abc');
    expect(result.dclid).toBe('dc1');
    expect(result.fbclid).toBe('fb2');
    expect(result.ttclid).toBe('tt3');
    expect(result.rdt_cid).toBe('rdt4');
    expect(result.msclkid).toBe('ms5');
    expect(result.li_fat_id).toBe('li6');
    expect(result.twclid).toBe('tw7');
  });

  it('captures referrer and landing page', () => {
    setLocation('https://game.example.com/landing');
    Object.defineProperty(document, 'referrer', {
      value: 'https://google.com/search?q=nft',
      configurable: true,
    });

    const result = collectSessionAttribution();
    expect(result.referrer).toBe('https://google.com/search?q=nft');
    expect(result.landing_page).toBe('https://game.example.com/landing');
  });

  it('caches in sessionStorage and returns cached on second call', () => {
    setLocation('https://example.com/?utm_source=google');

    const first = collectSessionAttribution();
    expect(first.utm_source).toBe('google');

    // Change URL — should still return cached value
    setLocation('https://example.com/?utm_source=facebook');
    const second = collectSessionAttribution();
    expect(second.utm_source).toBe('google');
  });

  it('parses referral_code from the URL', () => {
    setLocation('https://example.com/?referral_code=PARTNER42');

    const result = collectSessionAttribution();
    expect(result.referral_code).toBe('PARTNER42');
  });

  it('sets touchpoint_type to click when UTMs are present', () => {
    setLocation('https://example.com/?utm_source=google');

    const result = collectSessionAttribution();
    expect(result.touchpoint_type).toBe('click');
  });

  it('sets touchpoint_type to click when a click ID is present', () => {
    setLocation('https://example.com/?gclid=abc123');

    const result = collectSessionAttribution();
    expect(result.touchpoint_type).toBe('click');
  });

  it('does not set touchpoint_type when no UTMs or click IDs are present', () => {
    setLocation('https://example.com/');
    Object.defineProperty(document, 'referrer', { value: 'https://other.com', configurable: true });

    const result = collectSessionAttribution();
    expect(result.touchpoint_type).toBeUndefined();
  });

  it('returns empty attribution when no params are present', () => {
    setLocation('https://example.com/');
    Object.defineProperty(document, 'referrer', { value: '', configurable: true });

    const result = collectSessionAttribution();
    expect(result.utm_source).toBeUndefined();
    expect(result.gclid).toBeUndefined();
    expect(result.referrer).toBeUndefined();
  });

  it('handles sessionStorage being unavailable', () => {
    setLocation('https://example.com/?utm_source=twitter');
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });

    const result = collectSessionAttribution();
    expect(result.utm_source).toBe('twitter');
  });
});

describe('collectPageAttribution', () => {
  it('always parses from the current URL, ignoring sessionStorage', () => {
    setLocation('https://example.com/?utm_source=google');
    collectSessionAttribution(); // seeds sessionStorage

    // Change URL — collectSessionAttribution would return cached 'google',
    // but collectPageAttribution reads the new URL.
    setLocation('https://example.com/?utm_source=facebook');
    const result = collectPageAttribution();
    expect(result.utm_source).toBe('facebook');
  });

  it('does not write to sessionStorage', () => {
    setLocation('https://example.com/?utm_source=twitter');

    collectPageAttribution();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('does not include landing_page', () => {
    setLocation('https://example.com/?utm_source=google');

    const result = collectPageAttribution();
    expect(result.utm_source).toBe('google');
    expect(result.landing_page).toBeUndefined();
  });

  it('sets touchpoint_type to click when UTMs are present', () => {
    setLocation('https://example.com/?utm_source=google');

    const result = collectPageAttribution();
    expect(result.touchpoint_type).toBe('click');
  });

  it('captures referrer', () => {
    setLocation('https://example.com/');
    Object.defineProperty(document, 'referrer', {
      value: 'https://google.com/',
      configurable: true,
    });

    const result = collectPageAttribution();
    expect(result.referrer).toBe('https://google.com/');
  });
});

describe('clearAttribution', () => {
  it('removes cached attribution from sessionStorage', () => {
    setLocation('https://example.com/?utm_source=google');
    collectSessionAttribution();
    expect(sessionStorage.getItem(STORAGE_KEY)).not.toBeNull();

    clearAttribution();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe('getAttributionNetwork', () => {
  it.each([
    ['facebook', 'meta'],
    ['instagram', 'meta'],
    ['meta', 'meta'],
    ['fb', 'meta'],
    ['ig', 'meta'],
    ['FACEBOOK', 'meta'],
    ['tiktok', 'tiktok'],
    ['google', 'google'],
    ['reddit', 'reddit'],
    ['x', 'x'],
    ['twitter', 'x'],
  ])('classifies utm_source=%s with a paid utm_medium as %s', (source, expected) => {
    expect(getAttributionNetwork({ utm_source: source, utm_medium: 'cpc' })).toBe(expected);
  });

  it.each(['cpc', 'ppc', 'paid', 'paid_social', 'paidsocial', 'CPC'])(
    'treats utm_medium=%s as a paid medium',
    (medium) => {
      expect(getAttributionNetwork({ utm_source: 'facebook', utm_medium: medium })).toBe('meta');
    },
  );

  it.each([
    ['fbclid', 'meta'],
    ['ttclid', 'tiktok'],
    ['gclid', 'google'],
    ['dclid', 'google'],
    ['rdt_cid', 'reddit'],
    ['twclid', 'x'],
  ])('classifies %s presence as %s regardless of utm_source or utm_medium', (key, expected) => {
    expect(getAttributionNetwork({ [key]: '123' })).toBe(expected);
  });

  it.each(['msclkid', 'li_fat_id'])('classifies %s presence as other', (key) => {
    expect(getAttributionNetwork({ [key]: '123' })).toBe('other');
  });

  it('classifies an empty snapshot as organic', () => {
    expect(getAttributionNetwork({})).toBe('organic');
  });

  it('ignores empty-string click IDs', () => {
    expect(getAttributionNetwork({ fbclid: '' })).toBe('organic');
  });

  it('classifies an unrecognised utm_source as organic', () => {
    expect(getAttributionNetwork({ utm_source: 'newsletter', utm_medium: 'cpc' })).toBe('organic');
  });

  it('classifies utm_source alone without utm_medium as organic', () => {
    expect(getAttributionNetwork({ utm_source: 'facebook' })).toBe('organic');
  });

  it.each(['organic', 'social', 'referral', 'email'])(
    'classifies a matching utm_source with non-paid utm_medium=%s as organic',
    (medium) => {
      expect(getAttributionNetwork({ utm_source: 'facebook', utm_medium: medium })).toBe('organic');
    },
  );

  it('classifies from the snapshot, independent of the current URL', () => {
    // URL says Meta, but classification is driven solely by the snapshot.
    setLocation('https://example.com/?fbclid=abc');
    expect(getAttributionNetwork({ ttclid: 'xyz' })).toBe('tiktok');

    // A clean URL still classifies from the snapshot's click ID.
    setLocation('https://example.com/games/devilfish');
    expect(getAttributionNetwork({ fbclid: 'abc' })).toBe('meta');
  });
});

describe('getAttributionNetwork from the current URL (no snapshot)', () => {
  it.each([
    ['fbclid', 'meta'],
    ['ttclid', 'tiktok'],
    ['gclid', 'google'],
    ['rdt_cid', 'reddit'],
    ['twclid', 'x'],
  ])('classifies %s on the URL as %s', (param, expected) => {
    setLocation(`https://example.com/?${param}=123`);
    expect(getAttributionNetwork()).toBe(expected);
  });

  it('classifies a paid utm_source/medium on the URL', () => {
    setLocation('https://example.com/?utm_source=facebook&utm_medium=cpc');
    expect(getAttributionNetwork()).toBe('meta');
  });

  it('classifies no params on the URL as organic', () => {
    setLocation('https://example.com/');
    expect(getAttributionNetwork()).toBe('organic');
  });

  it('returns organic when there is no window (SSR)', () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'window');
    // @ts-expect-error simulate a non-browser runtime
    delete globalThis.window;
    expect(getAttributionNetwork()).toBe('organic');
    if (original) Object.defineProperty(globalThis, 'window', original);
  });
});
