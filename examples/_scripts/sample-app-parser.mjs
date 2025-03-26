/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const FILENAME = fileURLToPath(import.meta.url);
const DIRNAME = path.dirname(FILENAME);
const examplesDir = path.join(DIRNAME, '..', '_parsed');
const main = (product) => {
  const sampleAppDir = path.join(DIRNAME, '..', product);

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
      // add sidebar_order to metadata.json by using the features.json file
      const featuresContent = fs.readFileSync(path.join(appDir, 'features.json'), 'utf8');
      const features = JSON.parse(featuresContent);

      const metadataObject = JSON.parse(metadataContent);
      metadataObject.sidebar_order = features.order;
      metadataContent = JSON.stringify(metadataObject, null, 2);
      
    } catch (error) {
      console.log(`No metadata.json found for ${app}`);
    }
    
    // Check if tutorial.md exists but don't read its content
    let tutorialExists = false;
    try {
      tutorialExists = fs.existsSync(path.join(appDir, 'tutorial.md'));
      if (!tutorialExists) {
        console.log(`No tutorial.md found for ${app}`);
      }
    } catch (error) {
      console.log(`Error checking tutorial.md for ${app}: ${error.message}`);
    }

    // Add this app's data to the allApps object
    if (tutorialExists && metadataContent) {
      allApps[app] = {
        tutorial: `${app}.md`, // Use the app name instead of tutorial content
        metadata: JSON.parse(metadataContent),
      };
    }
  });

  if (!fs.existsSync(examplesDir)) {
    fs.mkdirSync(examplesDir, { recursive: true });
  }

  // Write a single JSON file in the product directory
  if (Object.keys(allApps).length > 0) {
    fs.writeFileSync(
      path.join(examplesDir, `${product}-examples.json`),
      JSON.stringify(allApps, null, 2),
    );
    console.log(`Created ${product}-examples.json with data for ${Object.keys(allApps).length} apps`);
  }

};

const products = ['passport', 'checkout', 'orderbook', 'contracts'];
products.forEach((product) => {
  main(product);
});
