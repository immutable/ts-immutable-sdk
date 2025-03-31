import * as fs from 'fs';
import * as path from 'path';

interface TestInfo {
  testId?: string;
}

interface Page {
  evaluate: (fn: () => any) => Promise<any>;
}

export async function saveCoverage(page: Page, testInfo: TestInfo) {
  const coverage = await page.evaluate(() => JSON.stringify((window as any).__coverage__));
  if (!coverage) return;
  
  const coverageDir = path.join(process.cwd(), '.nyc_output');
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true });
  }
  
  const id = testInfo.testId || Date.now();
  fs.writeFileSync(path.join(coverageDir, `coverage-${id}.json`), coverage);
} 