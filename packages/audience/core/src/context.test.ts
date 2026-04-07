import { collectContext } from './context';

describe('collectContext', () => {
  it('defaults to @imtbl/audience library name', () => {
    const ctx = collectContext();
    expect(ctx.library).toBe('@imtbl/audience');
    expect(ctx.libraryVersion).toBeDefined();
  });

  it('accepts custom library name and version', () => {
    const ctx = collectContext('@imtbl/audience-web-sdk', '1.0.0');
    expect(ctx.library).toBe('@imtbl/audience-web-sdk');
    expect(ctx.libraryVersion).toBe('1.0.0');
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
