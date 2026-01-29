#!/usr/bin/env node
/* eslint-disable */
/**
 * Post-build script to fix the Unity HTML bundle.
 * 
 * Parcel 2 with viem creates code-split bundles for the HTML target which don't work
 * in the Unity embedded browser. This script:
 * 1. Takes the complete JS bundle from the unreal target
 * 2. Creates a proper self-contained HTML file for Unity
 * 
 * The unreal target uses index.ts as entry point and produces a single complete JS bundle,
 * while the HTML target incorrectly splits the code.
 */

const fs = require('fs');
const path = require('path');

const UNITY_DIST_DIR = path.join(__dirname, '..', 'dist', 'unity');
const UNREAL_DIST_DIR = path.join(__dirname, '..', 'dist', 'unreal');
const HTML_FILE = path.join(UNITY_DIST_DIR, 'index.html');
const UNREAL_JS_FILE = path.join(UNREAL_DIST_DIR, 'index.js');

console.log('Fixing Unity build...');

// Read the complete JS bundle from unreal target
const jsContent = fs.readFileSync(UNREAL_JS_FILE, 'utf8');
console.log(`Read unreal bundle: ${jsContent.length} bytes`);

// Create a self-contained HTML file
const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>GameSDK Bridge</title>
    <script>${jsContent}</script>
</head>
<body>
</body>
</html>`;

// Ensure the unity dist directory exists
if (!fs.existsSync(UNITY_DIST_DIR)) {
  fs.mkdirSync(UNITY_DIST_DIR, { recursive: true });
}

// Write the fixed HTML
fs.writeFileSync(HTML_FILE, html, 'utf8');

console.log('Unity build fixed successfully!');
console.log(`Output: ${HTML_FILE} (${html.length} bytes)`);

// Clean up any split JS files from the broken HTML build
const jsFiles = fs.readdirSync(UNITY_DIST_DIR).filter(f => f.endsWith('.js'));
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
