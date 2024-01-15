import fs from 'fs';
import path from 'path';

const deprecateMessage = (message) => (
`/**
 * @deprecated ${message}
 */\n`
);

const dirname = path.dirname(new URL(import.meta.url).pathname);

// Read the JSON file
const fileData = fs.readFileSync(
  path.join(dirname, '..', 'module-release.json'),
);
const moduleData = JSON.parse(fileData);

// Get the release type from the environment variable or default to 'alpha'
const releaseType = process.env.RELEASE_TYPE || 'alpha';


let indexFileContent = `import * as imxClient from './immutablex_client';
import * as imxProvider from './provider';

export const x = {
  client: imxClient,
  provider: imxProvider,
};
`;

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

    if (moduleName === 'immutablex_client') {
      indexFileContent += deprecateMessage(`Use x.client or /x/client instead.`);
    };
    if (moduleName === 'provider') {
      indexFileContent += deprecateMessage(`Use x.provider or /x/provider instead.`);
    };

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
