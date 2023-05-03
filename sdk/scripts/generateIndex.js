import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Read the JSON file
const fileData = fs.readFileSync(
  path.join(__dirname, '..', 'module-release.json')
);
const moduleData = JSON.parse(fileData);

// Get the release type from the environment variable or default to 'alpha'
const releaseType = process.env.RELEASE_TYPE || 'alpha';

// Generate the index.ts file contents based on the release type
let indexFileContent = '';
for (const moduleName in moduleData.modules) {
  const moduleReleaseType = moduleData.modules[moduleName];

  if (
    releaseType === 'alpha' ||
    (releaseType !== 'alpha' && moduleReleaseType === 'prod')
  ) {
    const modulePath = `./${moduleName}`;
    const exportStatement = `export * from '${modulePath}';`;
    indexFileContent += exportStatement + '\n';
  }
}

// Write the index.ts file
fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'index.ts'),
  indexFileContent
);

console.log('index.ts file generated successfully!');
