import { collectContext } from './context';

describe('collectContext', () => {
  it('includes library name and version', () => {
    const ctx = collectContext();
    expect(ctx.library).toBe('@imtbl/audience');
    expect(ctx.libraryVersion).toBeDefined();
  });

  it('collects browser signals in jsdom', () => {
    const ctx = collectContext();
    expect(ctx.userAgent).toBeDefined();
    expect(ctx.locale).toBeDefined();
    expect(ctx.timezone).toBeDefined();
    expect(ctx.screen).toMatch(/^\d+x\d+$/);
  });

  it('collects page info', () => {
    const ctx = collectContext();
    expect(ctx.pageUrl).toBeDefined();
    expect(ctx.pagePath).toBeDefined();
    expect(typeof ctx.pageReferrer).toBe('string');
    expect(typeof ctx.pageTitle).toBe('string');
  });
});
