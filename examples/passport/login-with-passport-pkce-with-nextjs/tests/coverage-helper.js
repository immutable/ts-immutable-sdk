// This file is used by the testing framework to collect code coverage information
// It helps ensure that we're properly testing all aspects of the application

// These imports ensure the files are included in the coverage report
// even if they're not directly imported by the tests
import '../src/app/page.tsx';
import '../src/app/login-with-passport-pkce/page.tsx';
import '../src/app/redirect/page.tsx';
import '../src/app/logout/page.tsx';
import '../src/app/utils/setupDefault.ts';
import '../src/app/layout.tsx';

// This is a no-op function that ensures the file is executed
export function noop() {
  return true;
}

// Generate a coverage report for all key files
// This helps track which parts of the code are properly tested
export const filesToCover = [
  '../src/app/page.tsx',
  '../src/app/login-with-passport-pkce/page.tsx',
  '../src/app/redirect/page.tsx',
  '../src/app/logout/page.tsx',
  '../src/app/utils/setupDefault.ts',
  '../src/app/layout.tsx',
]; 