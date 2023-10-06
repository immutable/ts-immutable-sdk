import fs from 'fs';
import * as glob from 'glob';
import path from 'path';
import pkg from '../package.json' assert { type: 'json' };

const dirname = path.dirname(new URL(import.meta.url).pathname);

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

        // Point to the location of the checkout files correctly in checkout.js
        data = findAndReplace(data, 'return"static/js/"', 'return""');
        data = findAndReplace(
          data,
          'p="/immutable/ts-immutable-sdk/"',
          `p="https://cdn.jsdelivr.net/npm/@imtbl/sdk@${pkg.version}/dist/browser/"`,
        );

        // Add more findAndReplace if and when needed
        // data = findAndReplace(data, <find>, <replace>);

        fs.writeFileSync(destPath, data);
      });

      // Copy all *.chunk.js files
      const chunkFiles = glob.sync(path.join(dirname, '..', item.src.replace('main.*.js', '*.chunk.js')));
      chunkFiles.forEach((chunkFile) => {
        const destChunkPath = path.join(dirname, '..', item.dest.replace('checkout.js', path.basename(chunkFile)));

        const directoryChunkPath = path.dirname(destChunkPath);
        if (!fs.existsSync(directoryChunkPath)) {
          fs.mkdirSync(directoryChunkPath, { recursive: true });
        }

        fs.copyFileSync(chunkFile, destChunkPath);
      });
    }
  });
};

// Execute
main();
