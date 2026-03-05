import { collectContext } from './utils/runtime';

describe('collectContext', () => {
  it('includes library name and version', () => {
    const ctx = collectContext();
    expect(ctx.library).toBe('@imtbl/audience');
    expect(ctx.libraryVersion).toBeDefined();
  });

  it('collects browser details in jsdom', () => {
    const ctx = collectContext();
    expect(ctx.userAgent).toBeDefined();
    expect(ctx.locale).toBeDefined();
    expect(ctx.timezone).toBeDefined();
    expect(typeof ctx.screen).toBe('string');
  });

  it('collects page details', () => {
    const ctx = collectContext();
    expect(ctx.pageUrl).toBeDefined();
    expect(ctx.pagePath).toBeDefined();
    expect(typeof ctx.pageReferrer).toBe('string');
    expect(typeof ctx.pageTitle).toBe('string');
  });

  it('returns flat screen dimension string', () => {
    const ctx = collectContext();
    expect(ctx.screen).toMatch(/^\d+x\d+$/);
  });
});
