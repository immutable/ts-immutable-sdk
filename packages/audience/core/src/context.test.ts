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
    expect(ctx.screenDensity).toBeDefined();
  });

  it('collects page info', () => {
    const ctx = collectContext();
    expect(ctx.pageUrl).toBeDefined();
    expect(ctx.pagePath).toBeDefined();
    expect(typeof ctx.pageReferrer).toBe('string');
    expect(typeof ctx.pageTitle).toBe('string');
  });

  describe('field length limits', () => {
    // Backend maxLength: userAgent 512, pageReferrer/pageTitle 2048/256 -
    // none of these were truncated before, so a real long value (a big query
    // string on the referrer, an unusual UA string) could get the whole
    // message rejected server-side.
    it('truncates a userAgent longer than 512 chars', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'x'.repeat(600),
        configurable: true,
      });

      const ctx = collectContext();

      expect(ctx.userAgent).toHaveLength(512);
    });

    it('truncates a pageReferrer longer than 2048 chars', () => {
      Object.defineProperty(document, 'referrer', {
        value: `https://example.com/?q=${'x'.repeat(2100)}`,
        configurable: true,
      });

      const ctx = collectContext();

      expect(ctx.pageReferrer).toHaveLength(2048);
    });

    it('truncates a pageTitle longer than 256 chars', () => {
      document.title = 'x'.repeat(300);

      const ctx = collectContext();

      expect(ctx.pageTitle).toHaveLength(256);
    });
  });
});
