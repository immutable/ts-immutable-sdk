import * as fs from 'fs';
import * as path from 'path';
import { Page } from '@playwright/test';

export async function saveCoverage(page: Page, testInfo: any) {
  const coverage = await page.evaluate(() => {
    return JSON.stringify((window as any).__coverage__);
  });
  
  if (!coverage) return;
  
  const coverageDir = path.join(process.cwd(), '.nyc_output');
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true });
  }
  
  const id = testInfo.testId || Date.now();
  fs.writeFileSync(path.join(coverageDir, `coverage-${id}.json`), coverage);
} 