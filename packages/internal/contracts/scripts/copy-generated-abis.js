/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const CURRENT_DIR_PATH = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_DIRECTORY = '/../artifacts/contracts';
const DESTINATION_DIRECTORY = '/../src/abi';

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
 * @param {string[]} fileList
 * @param {string} destinationDirectory
 */
const copyFileListTo = (fileList, destinationDirectory) => {
  if (fileList.length === 0) {
    console.log('No abi files to copy!');
    return;
  }
  fileList.forEach((file) => {
    const fileName = path.basename(file);
    try {
      fs.copyFileSync(file, `${destinationDirectory}/${fileName}`);
    } catch (error) {
      console.error('Error copying file: ', error);
      process.exit(1);
    }
  });
  console.log(`Successfully copied ${fileList.length} ${fileList.length === 1 ? 'file' : 'files'}!
 * from: ${SOURCE_DIRECTORY.replace('/../', '')}
 * to:   ${destinationDirectory.split('/../')[1]}`);
};

const allAbiFiles = getAllFilesFrom(CURRENT_DIR_PATH + SOURCE_DIRECTORY);

copyFileListTo(allAbiFiles, CURRENT_DIR_PATH + DESTINATION_DIRECTORY);
