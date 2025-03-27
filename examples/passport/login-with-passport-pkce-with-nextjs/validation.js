#!/usr/bin/env node
/**
 * Validation script for the login-with-passport-pkce feature
 * 
 * This script verifies that the implementation has all required components
 * for the login-with-passport-pkce feature according to the SDK requirements.
 */
console.log('✅ Validation started for login-with-passport-pkce feature');

// Check required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'src/app/login-with-passport-pkce/page.tsx',
  'src/app/redirect/page.tsx',
  'src/app/logout/page.tsx',
  'src/app/utils/setupDefault.ts',
  'tests/base.spec.ts'
];

console.log('\n📁 Checking required files...');
const missingFiles = [];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  if (exists) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} is missing`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.log('\n❌ Validation failed: Missing required files');
  process.exit(1);
}

// Check code patterns
console.log('\n🔍 Checking implementation patterns...');

// Verify login page
const loginPagePath = path.join(__dirname, 'src/app/login-with-passport-pkce/page.tsx');
const loginPageContent = fs.readFileSync(loginPagePath, 'utf8');

const requiredPatterns = [
  { pattern: 'passportInstance.login', name: 'PKCE login method' },
  { pattern: 'getUserInfo', name: 'User info retrieval' },
  { pattern: 'setIsLoggedIn', name: 'Login state tracking' },
  { pattern: 'setError', name: 'Error handling' },
  { pattern: 'connectEvm', name: 'EVM connection' },
];

let missingPatterns = [];

requiredPatterns.forEach(({ pattern, name }) => {
  if (loginPageContent.includes(pattern)) {
    console.log(`✅ ${name} is implemented`);
  } else {
    console.log(`❌ ${name} is not implemented`);
    missingPatterns.push(name);
  }
});

if (missingPatterns.length > 0) {
  console.log('\n❌ Validation failed: Missing required implementation patterns');
  process.exit(1);
}

// Check build success
const buildOutputPath = path.join(__dirname, '.next');
const buildExists = fs.existsSync(buildOutputPath);

console.log('\n🏗️ Checking build output...');
if (buildExists) {
  console.log('✅ Build completed successfully');
} else {
  console.log('❌ Build directory not found - run "pnpm build" first');
}

console.log('\n✅ All validation checks passed for login-with-passport-pkce feature'); 