#!/usr/bin/env node
/*
 * prepack: strip workspace-protocol deps from package.json before `npm pack`.
 *
 * The runtime JS (dist/node, dist/browser) and the bundled .d.ts already
 * inline `@imtbl/audience-core` and its transitive `@imtbl/metrics` dep, so
 * they don't need to be listed as runtime deps in the published package. If
 * we left them, npm would choke on the `workspace:*` protocol at install.
 *
 * A sibling postpack.mjs restores the original package.json after the tarball
 * is written, so the developer's working tree is never left modified.
 */
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';

const pkgPath = new URL('../package.json', import.meta.url);
const backupPath = new URL('../package.json.prepack-backup', import.meta.url);

copyFileSync(pkgPath, backupPath);
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

// Deps bundled into dist/: remove from published metadata.
const bundledWorkspaceDeps = ['@imtbl/audience-core', '@imtbl/metrics'];
for (const name of bundledWorkspaceDeps) {
  if (pkg.dependencies) delete pkg.dependencies[name];
}
// Clean up empty dependencies object.
if (pkg.dependencies && Object.keys(pkg.dependencies).length === 0) {
  delete pkg.dependencies;
}

writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
console.log('[prepack] stripped bundled workspace deps from package.json');
