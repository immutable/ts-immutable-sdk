#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const HTML_FILE = path.join(DIST_DIR, 'index.html');

console.log('🔧 Fixing Unity build...');
console.log(`📁 Dist directory: ${DIST_DIR}`);

if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ Dist directory not found!');
  process.exit(1);
}

// Find all JS files (excluding .map files)
const jsFiles = fs.readdirSync(DIST_DIR)
  .filter(f => f.endsWith('.js') && !f.endsWith('.map'))
  .sort((a, b) => {
    // Main bundle first
    if (a.startsWith('game-bridge')) return -1;
    if (b.startsWith('game-bridge')) return 1;
    return a.localeCompare(b);
  });

console.log(`📦 Found ${jsFiles.length} JS file(s):`, jsFiles);

if (jsFiles.length === 0) {
  console.error('❌ No JS files found to inline!');
  process.exit(1);
}

// Combine all JS files
let combinedJs = '';
for (const jsFile of jsFiles) {
  const jsPath = path.join(DIST_DIR, jsFile);
  const jsContent = fs.readFileSync(jsPath, 'utf8');
  combinedJs += jsContent + '\n';
  console.log(`  ✅ ${jsFile}: ${jsContent.length} bytes`);
}

console.log(`📊 Total combined JavaScript: ${combinedJs.length} bytes`);

// Create new HTML with inlined JavaScript
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

// Write the new HTML file
fs.writeFileSync(HTML_FILE, html, 'utf8');
console.log(`✅ Unity build fixed successfully!`);
console.log(`📄 Output: ${HTML_FILE} (${html.length} bytes)`);

// Clean up: remove JS files and source maps
console.log('🧹 Cleaning up external JS files...');
for (const jsFile of jsFiles) {
  const jsPath = path.join(DIST_DIR, jsFile);
  fs.unlinkSync(jsPath);
  console.log(`  🗑️  Removed ${jsFile}`);
  
  const mapPath = jsPath + '.map';
  if (fs.existsSync(mapPath)) {
    fs.unlinkSync(mapPath);
    console.log(`  🗑️  Removed ${jsFile}.map`);
  }
}

console.log('✨ Done!');

