import { Page } from "@playwright/test";
import fs from 'fs';
import path from 'path';


export const interceptWidgets = async (page: Page, widgetsVersion: string = '*') => {

  return page.route(`https://cdn.jsdelivr.net/npm/@imtbl/sdk@${widgetsVersion}/dist/browser/checkout/**`, async route => {
    const url = new URL(route.request().url());
    const fileName = path.basename(url.pathname);
    let filePath = path.join(__dirname, 'local-widgets-js', fileName);

    // Special case for widgets-esm.js
    if (fileName === 'widgets-esm.js') {
      filePath = path.join(__dirname, 'local-widgets-js', 'index.js');
    }

    // console.log('Attempting to read file:', filePath);

    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        // console.log('File content length:', fileContent.length);

        // Fulfill the request with your local file content
        await route.fulfill({
          status: 200,
          contentType: 'application/javascript',
          body: fileContent
        });
        console.log(`
        Widgets successfully intercepted:
        Request:    ${url}
        File:       ${filePath}
        ------------------------------
        `)
      } else {
        throw new Error(`File does not exist: ${filePath}`);
      }
    } catch (error) {
        throw new Error(`Error reading file: ${String(error)}`);
    }
  });
}