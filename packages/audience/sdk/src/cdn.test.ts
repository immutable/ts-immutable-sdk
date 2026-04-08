/**
 * Smoke test for the CDN entry point. Verifies that importing `./cdn`
 * attaches { Audience, AudienceError, IdentityType } to window.ImmutableAudience.
 *
 * This tests the contract of cdn.ts — not the tsup build output. The bundle
 * itself is exercised by running `pnpm build` and loading the built file in
 * the demo page.
 */

describe('cdn entry point', () => {
  beforeEach(() => {
    delete (globalThis as unknown as { ImmutableAudience?: unknown }).ImmutableAudience;
    jest.resetModules();
  });

  afterEach(() => {
    delete (globalThis as unknown as { ImmutableAudience?: unknown }).ImmutableAudience;
  });

  it('attaches the SDK surface to window.ImmutableAudience', async () => {
    await import('./cdn');
    const g = (globalThis as unknown as {
      ImmutableAudience?: {
        Audience: { init: Function };
        AudienceError: typeof Error;
        IdentityType: Record<string, string>;
        version: string;
      };
    }).ImmutableAudience;

    expect(g).toBeDefined();
    expect(typeof g!.Audience.init).toBe('function');
    expect(g!.IdentityType.Passport).toBe('passport');
    expect(typeof g!.version).toBe('string');
    expect(g!.version.length).toBeGreaterThan(0);
    expect(g!.IdentityType.Steam).toBe('steam');
    expect(g!.IdentityType.Custom).toBe('custom');

    // AudienceError should be constructable and extend Error
    const err = new (g!.AudienceError as any)({
      code: 'NETWORK_ERROR',
      message: 'test',
      status: 0,
      endpoint: 'https://example.com',
    });
    expect(err).toBeInstanceOf(Error);
  });

  it('does not overwrite a pre-existing global', async () => {
    const sentinel = { Audience: 'FAKE' };
    (globalThis as unknown as { ImmutableAudience?: unknown }).ImmutableAudience = sentinel;

    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await import('./cdn');

    expect((globalThis as unknown as { ImmutableAudience?: unknown }).ImmutableAudience).toBe(sentinel);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('loaded twice'));
    warn.mockRestore();
  });
});
