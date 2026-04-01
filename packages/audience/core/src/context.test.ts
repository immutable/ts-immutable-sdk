import { collectContext, collectUtmParams, collectPageProperties } from './context';

describe('collectContext', () => {
  it('includes library and version', () => {
    const ctx = collectContext('@imtbl/audience');
    expect(ctx.library).toBe('@imtbl/audience');
    expect(ctx.libraryVersion).toBeDefined();
  });

  it('collects browser signals in jsdom', () => {
    const ctx = collectContext('@imtbl/audience');
    expect(ctx.userAgent).toBeDefined();
    expect(ctx.locale).toBeDefined();
    expect(ctx.timezone).toBeDefined();
    expect(ctx.screen).toMatch(/\d+x\d+/);
  });
});

describe('collectUtmParams', () => {
  const originalLocation = window.location;

  afterEach(() => {
    Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
  });

  it('returns empty object when no UTM params present', () => {
    expect(collectUtmParams()).toEqual({});
  });

  it('extracts UTM params from the URL', () => {
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, search: '?utm_source=twitter&utm_medium=cpc&other=ignored' },
      writable: true,
    });
    const utms = collectUtmParams();
    expect(utms).toEqual({ utm_source: 'twitter', utm_medium: 'cpc' });
  });
});

describe('collectPageProperties', () => {
  it('includes url, path, referrer, and title', () => {
    const props = collectPageProperties();
    expect(props).toHaveProperty('url');
    expect(props).toHaveProperty('path');
    expect(props).toHaveProperty('referrer');
    expect(props).toHaveProperty('title');
  });
});
