/**
 * AI API Connection Test Script
 * Tests OpenAI and Anthropic API connections
 * 
 * Usage: node test-ai-apis.js
 */

require('dotenv').config();
const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');

// ANSI color codes for terminal output
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

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

async function testOpenAI() {
  logSection('🤖 Testing OpenAI API Connection');
  
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    log('❌ OPENAI_API_KEY not configured in .env file', 'red');
    log('   Please add your OpenAI API key to backend/.env', 'yellow');
    return false;
  }
  
  log('✓ API key found in environment', 'green');
  log(`  Key preview: ${apiKey.substring(0, 10)}...`, 'blue');
  
  try {
    const openai = new OpenAI({ apiKey });
    
    log('\n📡 Sending test request to OpenAI...', 'blue');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: 'Say "Hello from OpenAI!" if you can read this.',
        },
      ],
      max_tokens: 20,
    });
    
    const reply = response.choices[0].message.content;
    
    log('\n✅ OpenAI API Connection Successful!', 'green');
    log(`   Model: ${response.model}`, 'blue');
    log(`   Response: "${reply}"`, 'blue');
    log(`   Tokens used: ${response.usage.total_tokens}`, 'blue');
    
    return true;
  } catch (error) {
    log('\n❌ OpenAI API Connection Failed', 'red');
    log(`   Error: ${error.message}`, 'red');
    
    if (error.status === 401) {
      log('   → Invalid API key. Please check your OPENAI_API_KEY', 'yellow');
    } else if (error.status === 429) {
      log('   → Rate limit exceeded or quota reached', 'yellow');
    } else if (error.code === 'ENOTFOUND') {
      log('   → Network error. Check your internet connection', 'yellow');
    }
    
    return false;
  }
}

async function testAnthropic() {
  logSection('🧠 Testing Anthropic (Claude) API Connection');
  
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    log('❌ ANTHROPIC_API_KEY not configured in .env file', 'red');
    log('   Please add your Anthropic API key to backend/.env', 'yellow');
    return false;
  }
  
  log('✓ API key found in environment', 'green');
  log(`  Key preview: ${apiKey.substring(0, 10)}...`, 'blue');
  
  try {
    const anthropic = new Anthropic({
      apiKey: apiKey
    });
    
    log('\n📡 Sending test request to Anthropic...', 'blue');
    
    const modelsToTry = [
      'claude-haiku-4-5-20251001',   // Claude Haiku 4.5 (current)
      'claude-sonnet-4-6',           // Claude Sonnet 4.6 (current)
    ];
    
    let message;
    let lastError;
    
    for (const model of modelsToTry) {
      try {
        log(`   Trying model: ${model}...`, 'blue');
        message = await anthropic.messages.create({
          model: model,
          max_tokens: 20,
          messages: [
            {
              role: 'user',
              content: 'Say "Hello from Claude!" if you can read this.',
            },
          ],
        });
        break; // Success! Exit loop
      } catch (err) {
        lastError = err;
        log(`   ${model} not available`, 'yellow');
      }
    }
    
    if (!message) {
      throw lastError; // All models failed
    }
    
    const reply = message.content[0].text;
    
    log('\n✅ Anthropic API Connection Successful!', 'green');
    log(`   Model: ${message.model}`, 'blue');
    log(`   Response: "${reply}"`, 'blue');
    log(`   Input tokens: ${message.usage.input_tokens}`, 'blue');
    log(`   Output tokens: ${message.usage.output_tokens}`, 'blue');
    
    return true;
  } catch (error) {
    log('\n❌ Anthropic API Connection Failed', 'red');
    log(`   Error: ${error.message}`, 'red');
    
    if (error.status === 401) {
      log('   → Invalid API key. Please check your ANTHROPIC_API_KEY', 'yellow');
    } else if (error.status === 429) {
      log('   → Rate limit exceeded or quota reached', 'yellow');
    } else if (error.code === 'ENOTFOUND') {
      log('   → Network error. Check your internet connection', 'yellow');
    }
    
    return false;
  }
}

async function runTests() {
  log('\n🧪 Brand Audit Tool - AI API Connection Test', 'cyan');
  log('Testing OpenAI and Anthropic API connections...\n', 'cyan');
  
  const openaiSuccess = await testOpenAI();
  const anthropicSuccess = await testAnthropic();
  
  logSection('📊 Test Summary');
  
  log(`OpenAI:    ${openaiSuccess ? '✅ Connected' : '❌ Failed'}`, 
      openaiSuccess ? 'green' : 'red');
  log(`Anthropic: ${anthropicSuccess ? '✅ Connected' : '❌ Failed'}`, 
      anthropicSuccess ? 'green' : 'red');
  
  if (openaiSuccess && anthropicSuccess) {
    log('\n🎉 All AI APIs are working correctly!', 'green');
    log('   Your brand audit tool is ready to use AI analysis.', 'green');
  } else if (openaiSuccess || anthropicSuccess) {
    log('\n⚠️  Partial success - some APIs are not configured', 'yellow');
    log('   The tool will work with the available API(s).', 'yellow');
  } else {
    log('\n❌ No AI APIs are configured', 'red');
    log('   Please add API keys to backend/.env file', 'yellow');
    log('\n📝 Setup Instructions:', 'cyan');
    log('   1. Copy backend/.env.example to backend/.env', 'blue');
    log('   2. Add your OpenAI API key (get from: https://platform.openai.com/api-keys)', 'blue');
    log('   3. Add your Anthropic API key (get from: https://console.anthropic.com/)', 'blue');
    log('   4. Run this test again: node test-ai-apis.js', 'blue');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  process.exit(openaiSuccess || anthropicSuccess ? 0 : 1);
}

// Run the tests
runTests().catch((error) => {
  log('\n💥 Unexpected error during testing:', 'red');
  console.error(error);
  process.exit(1);
});

// Made with Bob
