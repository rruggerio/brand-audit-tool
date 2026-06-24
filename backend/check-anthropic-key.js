/**
 * Anthropic API Key Diagnostic Script
 * Checks if your API key format is correct
 */

require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

console.log('\n' + '='.repeat(60));
log('🔍 Anthropic API Key Diagnostic', 'cyan');
console.log('='.repeat(60) + '\n');

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  log('❌ No ANTHROPIC_API_KEY found in environment', 'red');
  log('   Check your backend/.env file', 'yellow');
  process.exit(1);
}

log('✓ API key found in environment', 'green');
log(`  Full key length: ${apiKey.length} characters`, 'blue');
log(`  Key preview: ${apiKey.substring(0, 15)}...`, 'blue');

// Check key format
console.log('\n' + '-'.repeat(60));
log('Checking Key Format:', 'cyan');
console.log('-'.repeat(60));

const checks = [
  {
    name: 'Starts with sk-ant-',
    test: apiKey.startsWith('sk-ant-'),
    fix: 'Key should start with "sk-ant-"'
  },
  {
    name: 'Starts with sk-ant-api03-',
    test: apiKey.startsWith('sk-ant-api03-'),
    fix: 'Newer keys start with "sk-ant-api03-"'
  },
  {
    name: 'Has correct length',
    test: apiKey.length >= 100 && apiKey.length <= 150,
    fix: 'Key should be 100-150 characters long'
  },
  {
    name: 'No whitespace',
    test: !apiKey.includes(' ') && !apiKey.includes('\n') && !apiKey.includes('\t'),
    fix: 'Key should not contain spaces or newlines'
  },
  {
    name: 'Only valid characters',
    test: /^[a-zA-Z0-9_-]+$/.test(apiKey),
    fix: 'Key should only contain letters, numbers, hyphens, and underscores'
  }
];

let allPassed = true;

checks.forEach(check => {
  if (check.test) {
    log(`✓ ${check.name}`, 'green');
  } else {
    log(`✗ ${check.name}`, 'red');
    log(`  → ${check.fix}`, 'yellow');
    allPassed = false;
  }
});

console.log('\n' + '-'.repeat(60));
log('SDK Configuration:', 'cyan');
console.log('-'.repeat(60));

const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey });

log(`✓ SDK initialized`, 'green');
log(`  Base URL: ${client.baseURL || 'https://api.anthropic.com'}`, 'blue');
log(`  API Version: ${client.apiVersion || 'default'}`, 'blue');

console.log('\n' + '='.repeat(60));

if (allPassed) {
  log('✅ API Key Format Looks Good!', 'green');
  log('   The 404 errors are likely due to account access, not key format.', 'blue');
  log('   Contact Anthropic support to enable model access.', 'yellow');
} else {
  log('⚠️  API Key Format Issues Detected', 'yellow');
  log('   Fix the issues above and try again.', 'yellow');
  log('   You may need to regenerate your API key.', 'yellow');
}

console.log('='.repeat(60) + '\n');

process.exit(allPassed ? 0 : 1);

// Made with Bob
