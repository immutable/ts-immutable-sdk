/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 *
 * @param {string} directory
 * @returns {string[]}
 */
const getAllFilesFrom = (directory) => {
  const files = fs.readdirSync(directory, { withFileTypes: true });

  let fileList = [];

  files.forEach((file) => {
    const filePath = path.join(directory, file.name);

    if (
      file.isFile()
      && !file.name.includes('.dbg.json')
      && file.name.endsWith('.json')
    ) {
      fileList.push(filePath);
    } else if (file.isDirectory()) {
      const nestedFiles = getAllFilesFrom(filePath);
      fileList = fileList.concat(nestedFiles);
    }
  });

  return fileList;
};

/**
 *
 * @param {string} destinationDirectory
 * @param {string[]} fileList
 */
const copyFileListTo = (destinationDirectory, fileList) => {
  fileList.forEach((file) => {
    const fileName = path.basename(file);
    try {
      fs.copyFileSync(file, `${destinationDirectory}/${fileName}`);
    } catch (error) {
      console.error('Error copying file: ', error);
      process.exit(1);
    }
  });
};

const currentDirPath = path.dirname(fileURLToPath(import.meta.url));

const sourceDirectory = '/../../packages/internal/contracts/artifacts/contracts';
const destinationDirectory = '/../../packages/internal/contracts/src/abi';

const allAbiFiles = getAllFilesFrom(currentDirPath + sourceDirectory);

copyFileListTo(currentDirPath + destinationDirectory, allAbiFiles);
// eslint-disable-next-line max-len
console.log(`Successfully copied ${allAbiFiles.length} ${allAbiFiles.length === 1 ? 'file' : 'files'}!
 * from: ${sourceDirectory.replace('/../..', '')}
 * to:   ${destinationDirectory.replace('/../..', '')}`);
