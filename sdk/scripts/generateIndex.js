import fs from 'fs';
import path from 'path';

const dirname = path.dirname(new URL(import.meta.url).pathname);

// Read the JSON file
const fileData = fs.readFileSync(
  path.join(dirname, '..', 'module-release.json'),
);
const moduleData = JSON.parse(fileData);

// Get the release type from the environment variable or default to 'alpha'
const releaseType = process.env.RELEASE_TYPE || 'alpha';


let indexFileContent = '';

// Generate the index.ts file contents based on the release type
Object.keys(moduleData.modules).forEach((moduleName) => {
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
    const exportStatement = `export * as ${moduleNameCapitalized} from '${modulePath}';\n`;
    indexFileContent += exportStatement;
  }
});
// Write the index.ts file
fs.writeFileSync(
  path.join(process.cwd(), 'src', 'index.ts'),
  indexFileContent,
);

let browserIndexFileContent = '';

// Generate the index.ts file contents based on the release type
Object.keys(moduleData.modules).filter(m => !moduleData.excludeForBrowser.includes(m)).forEach((moduleName) => {
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
    const exportStatement = `export * as ${moduleNameCapitalized} from '${modulePath}';\n`;
    browserIndexFileContent += exportStatement;
  }
});

// Write the browser.index.ts file
fs.writeFileSync(
  path.join(process.cwd(), 'src', 'browser.index.ts'),
  browserIndexFileContent,
);