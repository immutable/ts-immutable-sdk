import fs from 'fs';
import * as glob from 'glob';
import path from 'path';
import pkg from '../package.json' assert { type: 'json' };
import { fileURLToPath } from 'url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const SDK_VERSION = '__SDK_VERSION__';

const getFiles = () => {
  // Read the JSON file
  const moduleReleaseData = fs.readFileSync(
    path.join(dirname, '..', 'module-release.json'),
  );
  const fileList = JSON.parse(moduleReleaseData.toString()).fileCopy;
  return fileList;
};

function findAndReplace(data, find, replace) {
  if (!data.includes(find)) return data;
  return data.replace(new RegExp(find, 'g'), replace);
}

const main = () => {
  const fileList = getFiles();

  const releaseType = process.env.RELEASE_TYPE || 'alpha';

  // Loop through each item in the list
  fileList.forEach((item) => {
    // Check if this item should be copied based on its "stage" property and RELEASE_TYPE environment variable
    if (
      releaseType === 'alpha'
      || (releaseType !== 'alpha' && item.stage === 'prod')
    ) {
      // Find all matching files using glob pattern matching
      const srcPath = path.join(dirname, '..', item.src);
      const files = glob.sync(srcPath);

      // Copy each file to its destination location
      files.forEach((sourceFile) => {
        const destPath = path.join(dirname, '..', item.dest);

        const directoryPath = path.dirname(destPath);
        if (!fs.existsSync(directoryPath)) {
          fs.mkdirSync(directoryPath, { recursive: true });
        }

        let data = fs.readFileSync(sourceFile, 'utf-8');

        data = findAndReplace(data, SDK_VERSION, pkg.version);
        // Add more findAndReplace if and when needed
        // data = findAndReplace(data, <find>, <replace>);

        fs.writeFileSync(destPath, data);

        // Copy over all js files when the copyAllJsFiles flag is set
        if (item.copyAllJsFiles) {
          const srcDirectory = path.dirname(sourceFile);
          const jsFiles = fs.readdirSync(srcDirectory);
          jsFiles.forEach((jsFile) => {
            // Check if the file is a .js file
            if (path.extname(jsFile) === '.js') {
              // Skip copying the original file and copy over all other .js files
              if (jsFile !== path.basename(sourceFile)) {
                const jsSrcPath = path.join(srcDirectory, jsFile);
                const jsDestPath = path.join(directoryPath, jsFile);
                fs.copyFileSync(jsSrcPath, jsDestPath);
              }
            }
          });
        }
      });
    }
  });
};

// Execute
main();
