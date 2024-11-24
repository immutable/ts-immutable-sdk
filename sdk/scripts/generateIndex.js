import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Read the JSON file
const fileData = fs.readFileSync(
  path.join(dirname, '..', 'module-release.json'),
);
const moduleData = JSON.parse(fileData);

// Get the release type from the environment variable or default to 'alpha'
const releaseType = process.env.RELEASE_TYPE || 'alpha';

const genExportStatements = (moduleName) => {
  const moduleReleaseType = moduleData.modules[moduleName];

  if (
    releaseType === 'alpha'
    || (releaseType !== 'alpha' && moduleReleaseType === 'prod')
  ) {
    // Split underscores and capitalize each word from the second
    const moduleNameCapitalized = moduleName.split('_')
      .map((part, index) => {
        if (index === 0) {
          return part;
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join('');

    const modulePath = `./${moduleName}`;
    return `export * as ${moduleNameCapitalized} from '${modulePath}';\n`;
  }
  return '';
}

// Generate the index.ts file contents based on the release type
const indexFileContent = Object.keys(moduleData.modules).reduce((acc, moduleName) => {
  return acc + genExportStatements(moduleName);
}, '');
// Write the index.ts file
fs.writeFileSync(
  path.join(process.cwd(), 'src', 'index.ts'),
  indexFileContent,
);

// Generate the index.ts file contents based on the release type
const browserIndexFileContent = Object.keys(moduleData.modules).filter(m => !moduleData.excludeForBrowser.includes(m)).reduce((acc, moduleName) => {
  return acc + genExportStatements(moduleName);
}, '');

// Write the browser.index.ts file
fs.writeFileSync(
  path.join(process.cwd(), 'src', 'browser.index.ts'),
  browserIndexFileContent,
);