#!/usr/bin/env node
/*
 * postpack: restore the package.json that prepack.mjs backed up.
 *
 * Runs after `npm pack` / `npm publish` finishes, so the developer's working
 * tree goes back to referencing `@imtbl/audience-core: workspace:*` for
 * local monorepo development.
 */
import { existsSync, copyFileSync, unlinkSync } from 'node:fs';

const pkgPath = new URL('../package.json', import.meta.url);
const backupPath = new URL('../package.json.prepack-backup', import.meta.url);

if (existsSync(backupPath)) {
  copyFileSync(backupPath, pkgPath);
  unlinkSync(backupPath);
  console.log('[postpack] restored original package.json');
}
