import { collectContext } from './context';

describe('collectContext', () => {
  it('includes required library fields', () => {
    const ctx = collectContext();
    expect(ctx.library).toBe('@imtbl/audience-web-sdk');
    expect(ctx.libraryVersion).toBeDefined();
  });

  it('collects browser signals in jsdom', () => {
    const ctx = collectContext();
    expect(ctx.userAgent).toBeDefined();
    expect(ctx.locale).toBeDefined();
    expect(ctx.timezone).toBeDefined();
    expect(ctx.screen).toMatch(/\d+x\d+/);
    expect(ctx.pageUrl).toBeDefined();
    expect(ctx.pagePath).toBeDefined();
  });

  it('collects page title', () => {
    document.title = 'Test Page';
    const ctx = collectContext();
    expect(ctx.pageTitle).toBe('Test Page');
  });
});
