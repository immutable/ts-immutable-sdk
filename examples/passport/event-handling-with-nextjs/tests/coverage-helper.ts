import * as fs from 'fs';
import * as path from 'path';
import type { Page, TestInfo } from '@playwright/test';

export async function saveCoverage(page: Page, testInfo: TestInfo): Promise<void> {
  try {
    // Try to evaluate the coverage data from the page
    const coverage = await page.evaluate(() => {
      // @ts-ignore - __coverage__ is dynamically added by the coverage instrumentation
      return window.__coverage__ ? JSON.stringify(window.__coverage__) : null;
    });
    
    if (!coverage) {
      console.log('No coverage data found for test:', testInfo.title);
      return;
    }
    
    // Create the coverage output directory if it doesn't exist
    const coverageDir = path.join(process.cwd(), '.nyc_output');
    if (!fs.existsSync(coverageDir)) {
      fs.mkdirSync(coverageDir, { recursive: true });
    }
    
    // Use a unique filename based on the test ID or timestamp
    const id = testInfo.testId || Date.now();
    const filename = path.join(coverageDir, `coverage-${id}.json`);
    
    // Write the coverage data to the file
    fs.writeFileSync(filename, coverage);
    console.log(`Coverage data saved to ${filename}`);
  } catch (error) {
    console.error('Error saving coverage data:', error);
  }
} 