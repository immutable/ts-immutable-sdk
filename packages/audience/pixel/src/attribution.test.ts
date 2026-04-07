import { collectAttribution, clearAttribution } from './attribution';

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

describe('collectAttribution', () => {
  it('parses UTM parameters from the URL', () => {
    setLocation(
      'https://example.com/?utm_source=google&utm_medium=cpc&utm_campaign=spring&utm_content=banner&utm_term=nft',
    );

    const result = collectAttribution();
    expect(result.utm_source).toBe('google');
    expect(result.utm_medium).toBe('cpc');
    expect(result.utm_campaign).toBe('spring');
    expect(result.utm_content).toBe('banner');
    expect(result.utm_term).toBe('nft');
  });

  it('parses ad network click IDs', () => {
    setLocation(
      'https://example.com/?gclid=abc123&fbclid=fb456&ttclid=tt789&msclkid=ms000',
    );

    const result = collectAttribution();
    expect(result.gclid).toBe('abc123');
    expect(result.fbclid).toBe('fb456');
    expect(result.ttclid).toBe('tt789');
    expect(result.msclkid).toBe('ms000');
  });

  it('captures referrer and landing page', () => {
    setLocation('https://game.example.com/landing');
    Object.defineProperty(document, 'referrer', {
      value: 'https://google.com/search?q=nft',
      configurable: true,
    });

    const result = collectAttribution();
    expect(result.referrer).toBe('https://google.com/search?q=nft');
    expect(result.landing_page).toBe('https://game.example.com/landing');
  });

  it('caches in sessionStorage and returns cached on second call', () => {
    setLocation('https://example.com/?utm_source=google');

    const first = collectAttribution();
    expect(first.utm_source).toBe('google');

    // Change URL — should still return cached value
    setLocation('https://example.com/?utm_source=facebook');
    const second = collectAttribution();
    expect(second.utm_source).toBe('google');
  });

  it('returns empty attribution when no params are present', () => {
    setLocation('https://example.com/');
    Object.defineProperty(document, 'referrer', { value: '', configurable: true });

    const result = collectAttribution();
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

    const result = collectAttribution();
    expect(result.utm_source).toBe('twitter');
  });
});

describe('clearAttribution', () => {
  it('removes cached attribution from sessionStorage', () => {
    setLocation('https://example.com/?utm_source=google');
    collectAttribution();
    expect(sessionStorage.getItem(STORAGE_KEY)).not.toBeNull();

    clearAttribution();
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
