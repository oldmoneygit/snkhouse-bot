const fs = require('fs');

const SECRET_PATTERNS = [
  {
    name: 'OpenAI API Key',
    pattern: /sk-proj-[a-zA-Z0-9]{20,}/g,
    severity: 'critical',
  }
];

function scanFile(filePath) {
  console.log(`Scanning file: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf-8');
  console.log(`Content: ${content}`);
  
  const secrets = [];
  
  SECRET_PATTERNS.forEach(({ name, pattern, severity }) => {
    console.log(`Testing pattern: ${pattern}`);
    const matches = content.match(pattern);
    console.log(`Matches: ${matches}`);
    if (matches) {
      secrets.push({
        name,
        severity,
        count: matches.length,
        preview: matches[0].substring(0, 20) + '...',
      });
    }
  });
  
  return { file: filePath, secrets };
}

// Test
const result = scanFile('./test-secret.ts');
console.log('Result:', JSON.stringify(result, null, 2));
