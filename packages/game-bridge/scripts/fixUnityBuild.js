#!/usr/bin/env node
/* eslint-disable */
/**
 * Post-build script to fix the Unity HTML bundle.
 * 
 * ROOT CAUSE:
 * viem uses dynamic import() for lazy-loading CCIP (Cross-Chain Interoperability Protocol) code:
 *   const { offchainLookup } = await import('../../utils/ccip.js');
 * (see: viem/_esm/actions/public/call.js line 126)
 * 
 * When Parcel builds the HTML target with <script type="module">, it:
 * 1. Creates a separate ccip.*.js chunk for the dynamic import
 * 2. Uses absolute paths in script src (e.g., /game-bridge.*.js) which don't work offline
 * 
 * Parcel's bundler configuration (minBundles, manualSharedBundles) only affects *shared* bundles
 * between multiple entry points, NOT async bundles from dynamic imports.
 * 
 * WORKAROUND:
 * This script inlines all external JS files into the HTML to create a self-contained bundle.
 * This ensures the Unity embedded browser (which runs offline) can load everything.
 */

const fs = require('fs');
const path = require('path');

const UNITY_DIST_DIR = path.join(__dirname, '..', 'dist', 'unity');
const HTML_FILE = path.join(UNITY_DIST_DIR, 'index.html');

console.log('Fixing Unity build...');

// Read all JS files in the dist directory (sorted so main bundle comes first)
const jsFiles = fs.readdirSync(UNITY_DIST_DIR)
  .filter(f => f.endsWith('.js') && !f.endsWith('.map'))
  .sort((a, b) => {
    // Main bundle should be first
    if (a.startsWith('game-bridge')) return -1;
    if (b.startsWith('game-bridge')) return 1;
    return a.localeCompare(b);
  });

console.log(`Found ${jsFiles.length} JS file(s):`, jsFiles);

// Combine all JS files
let combinedJs = '';
for (const jsFile of jsFiles) {
  const jsPath = path.join(UNITY_DIST_DIR, jsFile);
  const jsContent = fs.readFileSync(jsPath, 'utf8');
  combinedJs += jsContent + '\n';
  console.log(`  - ${jsFile}: ${jsContent.length} bytes`);
}

// Create a self-contained HTML file
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>GameSDK Bridge</title>
    <script>${combinedJs}</script>
</head>
<body>
</body>
</html>`;

// Write the fixed HTML
fs.writeFileSync(HTML_FILE, html, 'utf8');

console.log('Unity build fixed successfully!');
console.log(`Output: ${HTML_FILE} (${html.length} bytes)`);

// Clean up JS files (now inlined)
for (const jsFile of jsFiles) {
  const jsPath = path.join(UNITY_DIST_DIR, jsFile);
  fs.unlinkSync(jsPath);
  console.log(`Removed ${jsFile}`);
  
  // Also remove the map file if it exists
  const mapPath = jsPath + '.map';
  if (fs.existsSync(mapPath)) {
    fs.unlinkSync(mapPath);
    console.log(`Removed ${jsFile}.map`);
  }
}

console.log('Done!');
