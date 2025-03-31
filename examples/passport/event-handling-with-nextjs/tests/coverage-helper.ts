import * as fs from 'fs';
import * as path from 'path';

// Define a Window interface extension for code coverage
declare global {
  interface Window {
    __coverage__?: any;
  }
}

export async function saveCoverage(page: any, testInfo: any) {
  const coverage = await page.evaluate(() => {
    return window.__coverage__ ? JSON.stringify(window.__coverage__) : null;
  });
  
  if (!coverage) return;
  
  const coverageDir = path.join(process.cwd(), '.nyc_output');
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true });
  }
  
  const id = testInfo.testId || Date.now();
  fs.writeFileSync(path.join(coverageDir, `coverage-${id}.json`), coverage);
} 