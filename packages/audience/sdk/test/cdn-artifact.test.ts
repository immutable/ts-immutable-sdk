import * as fs from 'fs';
import * as path from 'path';

// Tests the actual built IIFE, not the TypeScript source. Catches failure
// modes that src/cdn.test.ts cannot: a broken tsup.cdn.js config, a missing
// noExternal entry, an unreplaced __SDK_VERSION__ placeholder, or an IIFE
// wrapper that clobbers the side-effect global assignment.
//
// Runs under testEnvironment: 'jsdom' so `window`, `navigator`, and
// `globalThis` are all present — matching a real <script>-tag load.

const ARTIFACT_PATH = path.resolve(
  __dirname,
  '../dist/cdn/imtbl-audience.global.js',
);

type AudienceInstance = {
  track: (...args: unknown[]) => unknown;
  shutdown: () => void;
};

type AudienceGlobal = {
  init: (config: { publishableKey: string; [k: string]: unknown }) => AudienceInstance;
  AudienceError: unknown;
  AudienceEvents: Record<string, string>;
  IdentityType: Record<string, string>;
  canIdentify: unknown;
  canTrack: unknown;
  version: string;
};

describe('CDN bundle artifact', () => {
  let g: AudienceGlobal;
  let fetchMock: jest.Mock;

  beforeAll(() => {
    if (!fs.existsSync(ARTIFACT_PATH)) {
      throw new Error(
        `CDN artifact not found at ${ARTIFACT_PATH}. `
        + 'Run `pnpm transpile:cdn` (or `pnpm build`) before this test.',
      );
    }

    // jsdom does not provide fetch; stub it before the bundle (or any init
    // call) touches it. Returns a generic OK so transport code does not
    // blow up when flushing queued events during the init() smoke test.
    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => '',
    });
    (globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;

    const source = fs.readFileSync(ARTIFACT_PATH, 'utf8');
    // Evaluates the pre-built bundle in the test's realm, the same way a
    // <script> tag does. Not user input — it's our own build output — so
    // the implied-eval rule doesn't apply. vm.runInThisContext was tried
    // first but runs in Node's root context, bypassing jsdom's window.
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
    new Function(source)();
    g = (globalThis as unknown as { ImmutableAudience: AudienceGlobal })
      .ImmutableAudience;
  });

  afterAll(() => {
    delete (globalThis as unknown as { ImmutableAudience?: unknown })
      .ImmutableAudience;
    delete (globalThis as unknown as { fetch?: unknown }).fetch;
  });

  it('attaches ImmutableAudience to globalThis as a side effect', () => {
    expect(g).toBeDefined();
  });

  it('exposes every runtime value that the npm entry exports', () => {
    expect(typeof g.init).toBe('function');
    expect(typeof g.AudienceError).toBe('function');
    expect(typeof g.AudienceEvents).toBe('object');
    expect(typeof g.IdentityType).toBe('object');
    expect(typeof g.canIdentify).toBe('function');
    expect(typeof g.canTrack).toBe('function');
    expect(typeof g.version).toBe('string');
  });

  it('replaces the __SDK_VERSION__ placeholder at build time', () => {
    expect(g.version).not.toBe('__SDK_VERSION__');
    expect(g.version.length).toBeGreaterThan(0);
  });

  it('populates the IdentityType enum', () => {
    expect(g.IdentityType.Passport).toBe('passport');
    expect(g.IdentityType.Steam).toBe('steam');
    expect(g.IdentityType.Custom).toBe('custom');
  });

  it('init() returns a working Audience instance end-to-end', () => {
    // Happy path a studio would copy-paste: ImmutableAudience.init({...}).
    // Verifies the IIFE wrapper preserved the class constructor end-to-end,
    // not just the type of init.
    const audience = g.init({ publishableKey: 'pk_test_smoketest' });
    try {
      expect(audience).toBeDefined();
      expect(typeof audience.track).toBe('function');
      expect(typeof audience.shutdown).toBe('function');
    } finally {
      audience.shutdown();
    }
  });
});
