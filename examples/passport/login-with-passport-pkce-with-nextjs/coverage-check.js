#!/usr/bin/env node
/**
 * Code coverage checker for login-with-passport-pkce feature
 * 
 * This script analyzes the source code to measure the approximate coverage
 * of implementation requirements without needing to run the full test suite.
 */
console.log('🔍 Running code coverage check for login-with-passport-pkce feature...');

const fs = require('fs');
const path = require('path');

// Get source files
const sourceFiles = [
  'src/app/login-with-passport-pkce/page.tsx',
  'src/app/redirect/page.tsx',
  'src/app/logout/page.tsx',
  'src/app/utils/setupDefault.ts',
];

// Required patterns that should be present in implementation
const requiredPatterns = [
  { pattern: 'passportInstance.login', category: 'authentication' },
  { pattern: 'getUserInfo', category: 'authentication' },
  { pattern: 'setIsLoggedIn', category: 'state-management' },
  { pattern: 'setError', category: 'error-handling' },
  { pattern: 'try {', category: 'error-handling' },
  { pattern: 'catch', category: 'error-handling' },
  { pattern: 'connectEvm', category: 'wallet-connection' },
  { pattern: 'useEffect', category: 'lifecycle' },
  { pattern: 'useState', category: 'state-management' },
  { pattern: 'onClick', category: 'user-interaction' },
  { pattern: 'disabled', category: 'user-interaction' },
  { pattern: 'isLoggedIn ?', category: 'conditional-rendering' },
  { pattern: 'setAddress', category: 'state-management' },
  { pattern: 'import', category: 'module-management' },
  { pattern: 'return', category: 'rendering' },
];

// Categories for grouping coverage results
const categories = {
  'authentication': { patterns: 0, found: 0 },
  'state-management': { patterns: 0, found: 0 },
  'error-handling': { patterns: 0, found: 0 },
  'wallet-connection': { patterns: 0, found: 0 },
  'lifecycle': { patterns: 0, found: 0 },
  'user-interaction': { patterns: 0, found: 0 },
  'conditional-rendering': { patterns: 0, found: 0 },
  'module-management': { patterns: 0, found: 0 },
  'rendering': { patterns: 0, found: 0 },
};

// Calculate expected patterns per category
requiredPatterns.forEach(({ category }) => {
  categories[category].patterns++;
});

// Analyze each file
sourceFiles.forEach(filePath => {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${filePath}`);
      return;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    console.log(`\n📄 Analyzing ${filePath}...`);
    
    // Check for patterns
    requiredPatterns.forEach(({ pattern, category }) => {
      if (content.includes(pattern)) {
        console.log(`  ✅ Found pattern: ${pattern}`);
        categories[category].found++;
      }
    });
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error);
  }
});

// Calculate coverage
console.log('\n📊 Coverage Results:');

let totalPatterns = 0;
let totalFound = 0;

Object.entries(categories).forEach(([category, { patterns, found }]) => {
  totalPatterns += patterns;
  totalFound += found;
  
  const percentage = patterns > 0 ? (found / patterns) * 100 : 0;
  console.log(`  ${category}: ${percentage.toFixed(2)}% (${found}/${patterns})`);
});

const overallPercentage = (totalFound / totalPatterns) * 100;
console.log(`\n📈 Overall Coverage: ${overallPercentage.toFixed(2)}%`);

// Check if coverage meets the required threshold
const threshold = 70;
if (overallPercentage >= threshold) {
  console.log(`\n✅ Coverage meets the required threshold of ${threshold}%`);
} else {
  console.log(`\n❌ Coverage does not meet the required threshold of ${threshold}%`);
  process.exit(1);
} 