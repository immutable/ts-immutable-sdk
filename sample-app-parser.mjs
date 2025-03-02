/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);
const examplesDir = path.join(DIRNAME, 'examples', '_parsed');
const main = (product) => {
  const sampleAppDir = path.join(DIRNAME, 'examples', product);

  // Create an object to hold all app data
  const allApps = {};

  // Get all sample app directories
  const sampleApps = fs.readdirSync(sampleAppDir);

  // Process each app
  sampleApps.forEach((app) => {
    const appDir = path.join(sampleAppDir, app);

    // Handle missing metadata.json
    let metadataContent = '{}';
    try {
      metadataContent = fs.readFileSync(path.join(appDir, 'metadata.json'), 'utf8');
    } catch (error) {
      console.log(`No metadata.json found for ${app}`);
    }

    // Handle missing tutorial.md
    let tutorial = '';
    try {
      tutorial = fs.readFileSync(path.join(appDir, 'tutorial.md'), 'utf8');
    } catch (error) {
      console.log(`No tutorial.md found for ${app}`);
    }

    // Add this app's data to the allApps object
    if (tutorial && metadataContent) {
      allApps[app] = {
        tutorial,
        metadata: JSON.parse(metadataContent),
      };
    }
  });

  if (!fs.existsSync(examplesDir)) {
    fs.mkdirSync(examplesDir, { recursive: true });
  }

  // Write a single JSON file in the product directory
  fs.writeFileSync(
    path.join(examplesDir, `${product}-examples.json`),
    JSON.stringify(allApps, null, 2),
  );

  console.log(`Created ${product}-examples.json with data for ${Object.keys(allApps).length} apps`);
};

const products = ['passport']; // 'checkout', 'orderbook', 'contracts' etc
products.forEach((product) => {
  main(product);
});
