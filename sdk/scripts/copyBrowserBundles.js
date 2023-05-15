import fs from 'fs';
import glob from 'glob';
import path from 'path';

const dirname = path.dirname(new URL(import.meta.url).pathname);

const getFiles = () => {
  // Read the JSON file
  const moduleReleaseData = fs.readFileSync(
    path.join(dirname, '..', 'module-release.json'),
  );
  const fileList = JSON.parse(moduleReleaseData.toString()).fileCopy;
  return fileList;
};

// Recursively check if target directory exists
// If not, create it
// Then copy the sourceFile to targetFile
const copyFileSync = (sourceFile, targetFile) => {
  // Check if target directory exists
  const targetDir = path.dirname(targetFile);
  if (!fs.existsSync(targetDir)) {
    // Create it
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy the file
  fs.copyFileSync(sourceFile, targetFile);
};

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
        copyFileSync(sourceFile, destPath);
      });
    }
  });
};

// Execute
main();
