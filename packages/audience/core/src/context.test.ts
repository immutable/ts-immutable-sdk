import { collectContext } from './context';

describe('collectContext', () => {
  it('includes library name and version from parameters', () => {
    const ctx = collectContext('@imtbl/audience', '1.0.0');
    expect(ctx.library).toBe('@imtbl/audience');
    expect(ctx.libraryVersion).toBe('1.0.0');
  });

  it('collects browser signals in jsdom', () => {
    const ctx = collectContext('@imtbl/audience', '1.0.0');
    expect(ctx.userAgent).toBeDefined();
    expect(ctx.locale).toBeDefined();
    expect(ctx.timezone).toBeDefined();
    expect(ctx.screen).toMatch(/^\d+x\d+$/);
  });

  it('collects page info', () => {
    const ctx = collectContext('@imtbl/audience', '1.0.0');
    expect(ctx.pageUrl).toBeDefined();
    expect(ctx.pagePath).toBeDefined();
    expect(typeof ctx.pageReferrer).toBe('string');
    expect(typeof ctx.pageTitle).toBe('string');
  });
});
