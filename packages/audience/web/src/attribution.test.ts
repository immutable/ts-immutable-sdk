import { parseAttribution } from './attribution';

const originalLocation = window.location;

beforeEach(() => {
  sessionStorage.clear();
});

afterEach(() => {
  Object.defineProperty(window, 'location', {
    value: originalLocation,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(document, 'referrer', {
    value: '',
    configurable: true,
  });
});

describe('parseAttribution', () => {
  it('parses UTM params from the URL', () => {
    Object.defineProperty(window, 'location', {
      value: {
        search: '?utm_source=youtube&utm_medium=influencer&utm_campaign=launch',
        href: 'https://studio.com/shop?utm_source=youtube&utm_medium=influencer&utm_campaign=launch',
      },
      writable: true,
      configurable: true,
    });

    const ctx = parseAttribution();
    expect(ctx.utm_source).toBe('youtube');
    expect(ctx.utm_medium).toBe('influencer');
    expect(ctx.utm_campaign).toBe('launch');
    expect(ctx.landing_page).toBe(window.location.href);
  });

  it('parses click IDs from the URL', () => {
    Object.defineProperty(window, 'location', {
      value: {
        search: '?gclid=abc&fbclid=def&ttclid=ghi&msclkid=jkl&dclid=mno&li_fat_id=pqr',
        href: 'https://studio.com/?gclid=abc&fbclid=def&ttclid=ghi&msclkid=jkl&dclid=mno&li_fat_id=pqr',
      },
      writable: true,
      configurable: true,
    });

    const ctx = parseAttribution();
    expect(ctx.gclid).toBe('abc');
    expect(ctx.fbclid).toBe('def');
    expect(ctx.ttclid).toBe('ghi');
    expect(ctx.msclkid).toBe('jkl');
    expect(ctx.dclid).toBe('mno');
    expect(ctx.li_fat_id).toBe('pqr');
  });

  it('parses ref param as referral_code', () => {
    Object.defineProperty(window, 'location', {
      value: {
        search: '?ref=creator_handle',
        href: 'https://studio.com/?ref=creator_handle',
      },
      writable: true,
      configurable: true,
    });

    const ctx = parseAttribution();
    expect(ctx.referral_code).toBe('creator_handle');
  });

  it('returns cached attribution on subsequent calls within session', () => {
    Object.defineProperty(window, 'location', {
      value: {
        search: '?utm_source=first',
        href: 'https://studio.com/?utm_source=first',
      },
      writable: true,
      configurable: true,
    });

    const first = parseAttribution();
    expect(first.utm_source).toBe('first');

    // Change URL (simulating SPA navigation)
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
        href: 'https://studio.com/shop',
      },
      writable: true,
      configurable: true,
    });

    const second = parseAttribution();
    expect(second.utm_source).toBe('first'); // Still the original
  });

  it('captures document.referrer', () => {
    Object.defineProperty(document, 'referrer', {
      value: 'https://google.com/search?q=immutable',
      configurable: true,
    });
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
        href: 'https://studio.com/',
      },
      writable: true,
      configurable: true,
    });

    const ctx = parseAttribution();
    expect(ctx.referrer).toBe('https://google.com/search?q=immutable');
  });

  it('only includes params that are present', () => {
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
        href: 'https://studio.com/',
      },
      writable: true,
      configurable: true,
    });

    const ctx = parseAttribution();
    expect(ctx.utm_source).toBeUndefined();
    expect(ctx.gclid).toBeUndefined();
    expect(ctx.landing_page).toBe('https://studio.com/');
  });
});
