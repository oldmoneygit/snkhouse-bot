const fs = require('fs');
const path = require('path');

const SAFE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.env.example'];
const IGNORE_PATTERNS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  '.husky',
];

function shouldCheckFile(filePath) {
  const ext = path.extname(filePath);
  console.log(`Checking file: ${filePath}, ext: ${ext}`);
  
  if (!SAFE_EXTENSIONS.includes(ext)) {
    console.log(`  ❌ Extension not safe: ${ext}`);
    return false;
  }
  
  const shouldIgnore = IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
  if (shouldIgnore) {
    console.log(`  ❌ File ignored: ${filePath}`);
    return false;
  }
  
  console.log(`  ✅ File should be checked: ${filePath}`);
  return true;
}

// Test the specific file
const testFile = './test-secret.ts';
console.log(`Testing file: ${testFile}`);
const result = shouldCheckFile(testFile);
console.log(`Result: ${result}`);
