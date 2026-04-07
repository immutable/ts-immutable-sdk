import { parseAttribution, attributionToProperties } from './attribution';

beforeEach(() => {
  sessionStorage.clear();
});

describe('parseAttribution', () => {
  it('parses UTM params from the URL', () => {
    Object.defineProperty(window, 'location', {
      value: {
        search: '?utm_source=youtube&utm_medium=influencer&utm_campaign=launch',
        href: 'https://studio.com/shop?utm_source=youtube&utm_medium=influencer&utm_campaign=launch',
      },
      writable: true,
    });

    const ctx = parseAttribution();
    expect(ctx.utmSource).toBe('youtube');
    expect(ctx.utmMedium).toBe('influencer');
    expect(ctx.utmCampaign).toBe('launch');
    expect(ctx.landingPage).toBe(window.location.href);
  });

  it('parses click IDs from the URL', () => {
    Object.defineProperty(window, 'location', {
      value: {
        search: '?gclid=abc&fbclid=def&ttclid=ghi&msclkid=jkl&dclid=mno&li_fat_id=pqr',
        href: 'https://studio.com/?gclid=abc&fbclid=def&ttclid=ghi&msclkid=jkl&dclid=mno&li_fat_id=pqr',
      },
      writable: true,
    });

    const ctx = parseAttribution();
    expect(ctx.gclid).toBe('abc');
    expect(ctx.fbclid).toBe('def');
    expect(ctx.ttclid).toBe('ghi');
    expect(ctx.msclkid).toBe('jkl');
    expect(ctx.dclid).toBe('mno');
    expect(ctx.li_fat_id).toBe('pqr');
  });

  it('parses ref param as referralCode', () => {
    Object.defineProperty(window, 'location', {
      value: {
        search: '?ref=creator_handle',
        href: 'https://studio.com/?ref=creator_handle',
      },
      writable: true,
    });

    const ctx = parseAttribution();
    expect(ctx.referralCode).toBe('creator_handle');
  });

  it('returns cached attribution on subsequent calls within session', () => {
    Object.defineProperty(window, 'location', {
      value: {
        search: '?utm_source=first',
        href: 'https://studio.com/?utm_source=first',
      },
      writable: true,
    });

    const first = parseAttribution();
    expect(first.utmSource).toBe('first');

    // Change URL (simulating SPA navigation)
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
        href: 'https://studio.com/shop',
      },
      writable: true,
    });

    const second = parseAttribution();
    expect(second.utmSource).toBe('first'); // Still the original
  });

  it('returns empty context with no params', () => {
    Object.defineProperty(window, 'location', {
      value: {
        search: '',
        href: 'https://studio.com/',
      },
      writable: true,
    });

    const ctx = parseAttribution();
    expect(ctx.utmSource).toBeUndefined();
    expect(ctx.gclid).toBeUndefined();
    expect(ctx.landingPage).toBe('https://studio.com/');
  });
});

describe('attributionToProperties', () => {
  it('converts attribution context to flat properties', () => {
    const props = attributionToProperties({
      utmSource: 'youtube',
      utmMedium: 'influencer',
      gclid: 'abc',
      dclid: 'mno',
      li_fat_id: 'pqr',
      referralCode: 'ref123',
      landingPage: 'https://studio.com/',
    });

    expect(props).toEqual({
      utm_source: 'youtube',
      utm_medium: 'influencer',
      gclid: 'abc',
      dclid: 'mno',
      li_fat_id: 'pqr',
      referral_code: 'ref123',
      landing_page: 'https://studio.com/',
    });
  });

  it('omits undefined fields', () => {
    const props = attributionToProperties({ utmSource: 'youtube' });
    expect(props).toEqual({ utm_source: 'youtube' });
    expect(props).not.toHaveProperty('utm_medium');
  });
});
