import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = [
  'dist/browser/index.js',
  'dist/node/index.js',
  'dist/node/index.cjs',
];

const webpackIgnore = 'webpackIgnore: true';
// Matches import(/* ... */ `https://cdn.jsdelivr.net/...`) including multiline forms
const inlinedImport =
  /import\s*\((?:.|\n){0,80}?`https:\/\/cdn\.jsdelivr\.net\/npm\/@imtbl\/checkout-widgets@/;

let failed = false;

for (const relativePath of files) {
  const absolutePath = join(root, relativePath);
  let source;
  try {
    source = readFileSync(absolutePath, 'utf8');
  } catch {
    console.error(`Missing build output: ${relativePath}`);
    failed = true;
    continue;
  }

  if (!source.includes(webpackIgnore)) {
    console.error(
      `${relativePath}: missing /* webpackIgnore: true */ on widgets CDN import`,
    );
    failed = true;
  }

  if (inlinedImport.test(source)) {
    console.error(
      `${relativePath}: widgets CDN URL was inlined into import(); keep it in a variable`,
    );
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log(
  'assert-widgets-import: webpackIgnore preserved and CDN import not inlined',
);
