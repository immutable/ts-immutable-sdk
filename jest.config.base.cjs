const fs = require('node:fs');
const path = require('node:path');

const workspaceRoot = __dirname;

/**
 * Map `@imtbl/<name>` → `<packageRoot>/src` from workspace package.json files.
 * Avoids relying on `publicHoistPattern: ['@imtbl/*']`.
 */
function buildImtblSrcMapper() {
  /** @type {Record<string, string>} */
  const mapper = {};
  const candidates = [
    'sdk',
    'packages',
  ];

  /** @param {string} dir */
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (
        ent.name === 'node_modules' ||
        ent.name === 'dist' ||
        ent.name === 'sample-app'
      ) {
        continue;
      }
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
        continue;
      }
      if (ent.name !== 'package.json') continue;
      const pkg = JSON.parse(fs.readFileSync(full, 'utf8'));
      if (!pkg.name?.startsWith('@imtbl/')) continue;
      const pkgRoot = path.dirname(full);
      const srcDir = path.join(pkgRoot, 'src');
      if (!fs.existsSync(srcDir)) continue;
      // Exact package name → src root; subpaths → src/<subpath>
      mapper[`^${pkg.name}$`] = srcDir;
      mapper[`^${pkg.name}/(.*)$`] = path.join(srcDir, '$1');
    }
  }

  for (const rel of candidates) {
    walk(path.join(workspaceRoot, rel));
  }
  return mapper;
}

const imtblSrcMapper = buildImtblSrcMapper();

/**
 * Shared Jest preset for SDK packages.
 * Maps @imtbl/* to workspace package sources so tests don't need a prior full build.
 *
 * @param {import('jest').Config & {
 *   testEnvironment?: 'node' | 'jsdom',
 *   moduleNameMapper?: Record<string, string>,
 * }} options
 * @returns {import('jest').Config}
 */
function createPackageJestConfig(options = {}) {
  const {
    testEnvironment = 'node',
    setupFiles,
    setupFilesAfterEnv,
    restoreMocks,
    verbose,
    transformIgnorePatterns = [],
    coveragePathIgnorePatterns,
    moduleNameMapper = {},
    roots = ['<rootDir>/src'],
    transform = {
      '^.+\\.(t|j)sx?$': '@swc/jest',
    },
  } = options;

  return {
    clearMocks: true,
    coverageProvider: 'v8',
    moduleDirectories: ['node_modules', 'src'],
    roots,
    testEnvironment,
    transform,
    transformIgnorePatterns,
    moduleNameMapper: {
      // Package-specific mappers first (Jest uses first match).
      ...moduleNameMapper,
      ...imtblSrcMapper,
    },
    ...(setupFiles ? { setupFiles } : {}),
    ...(setupFilesAfterEnv ? { setupFilesAfterEnv } : {}),
    ...(restoreMocks ? { restoreMocks } : {}),
    ...(verbose ? { verbose } : {}),
    ...(coveragePathIgnorePatterns
      ? { coveragePathIgnorePatterns }
      : {}),
  };
}

function createNodeJestConfig(options = {}) {
  return createPackageJestConfig({ ...options, testEnvironment: 'node' });
}

function createJsdomJestConfig(options = {}) {
  return createPackageJestConfig({ ...options, testEnvironment: 'jsdom' });
}

function workspacePath(...segments) {
  return path.join(workspaceRoot, ...segments);
}

module.exports = {
  createPackageJestConfig,
  createNodeJestConfig,
  createJsdomJestConfig,
  workspacePath,
  workspaceRoot,
};
