import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Read the module-release.json file
const moduleReleaseData = fs.readFileSync(
  path.join(__dirname, '..', 'module-release.json')
);
const moduleData = JSON.parse(moduleReleaseData);

// Get the release type from the environment variable or default to 'alpha'
const releaseType = process.env.RELEASE_TYPE || 'alpha';

// Update the package.json exports based on the release type
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJsonData = fs.readFileSync(packageJsonPath, 'utf8');
const packageJson = JSON.parse(packageJsonData);

const exports = {
  './package.json': './package.json',
  '.': {
    types: './dist/config.d.ts',
    import: './dist/config.js',
    require: './dist/index.cjs',
  },
};

for (const moduleName in moduleData.modules) {
  if (moduleName === 'config') {
    continue; // Skip config module as it's explicitly defined for '.'
  }

  const moduleReleaseType = moduleData.modules[moduleName];

  if (
    releaseType === 'alpha' ||
    (releaseType !== 'alpha' && moduleReleaseType === 'prod')
  ) {
    const moduleExport = `./${moduleName}`;
    const modulePath = `./dist/${moduleName}.js`;
    const typesPath = `./dist/${moduleName}.d.ts`;

    exports[moduleExport] = {
      types: typesPath,
      import: modulePath,
    };
  }
}

packageJson.exports = exports;

// Write the updated package.json file
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('Package.json exports updated successfully!');
