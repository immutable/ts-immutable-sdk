import * as fs from 'fs';
import * as path from 'path';

// Extend Window interface to include coverage property
declare global {
  interface Window {
    __coverage__?: any;
  }
}

export async function saveCoverage(page: any, testInfo: any) {
  const coverage = await page.evaluate(() => JSON.stringify(window.__coverage__));
  if (!coverage) return;
  
  const coverageDir = path.join(process.cwd(), '.nyc_output');
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true });
  }
  
  const id = testInfo.testId || Date.now();
  fs.writeFileSync(path.join(coverageDir, `coverage-${id}.json`), coverage);
} 