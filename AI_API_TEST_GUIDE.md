# AI API Connection Test Guide

This guide explains how to test your OpenAI and Anthropic (Claude) API connections.

## Prerequisites

Before testing, you need:

1. **OpenAI API Key** (Optional but recommended)
   - Sign up at: https://platform.openai.com/
   - Get API key from: https://platform.openai.com/api-keys
   - Pricing: Pay-as-you-go (GPT-4: ~$0.03 per 1K tokens)

2. **Anthropic API Key** (Optional but recommended)
   - Sign up at: https://console.anthropic.com/
   - Get API key from: https://console.anthropic.com/settings/keys
   - Pricing: Pay-as-you-go (Claude 3.5 Sonnet: ~$0.003 per 1K tokens)

## Setup Instructions

### Step 1: Create .env File

```bash
cd brand-audit-tool/backend
cp .env.example .env
```

### Step 2: Add Your API Keys

Edit `backend/.env` and add your keys:

```env
# AI Service API Keys
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
```

**Important:** 
- Keep your API keys secret
- Never commit `.env` to git (it's already in .gitignore)
- You can use one or both APIs

### Step 3: Run the Test

```bash
cd brand-audit-tool/backend
node test-ai-apis.js
```

## Expected Output

### ✅ Success (Both APIs Working)

```
🧪 Brand Audit Tool - AI API Connection Test
Testing OpenAI and Anthropic API connections...

============================================================
🤖 Testing OpenAI API Connection
============================================================
✓ API key found in environment
  Key preview: sk-proj-ab...

📡 Sending test request to OpenAI...

✅ OpenAI API Connection Successful!
   Model: gpt-4-0613
   Response: "Hello from OpenAI!"
   Tokens used: 15

============================================================
🧠 Testing Anthropic (Claude) API Connection
============================================================
✓ API key found in environment
  Key preview: sk-ant-api...

📡 Sending test request to Anthropic...

✅ Anthropic API Connection Successful!
   Model: claude-3-5-sonnet-20241022
   Response: "Hello from Claude!"
   Input tokens: 12
   Output tokens: 5

============================================================
📊 Test Summary
============================================================
OpenAI:    ✅ Connected
Anthropic: ✅ Connected

🎉 All AI APIs are working correctly!
   Your brand audit tool is ready to use AI analysis.
```

### ❌ No API Keys Configured

```
❌ OPENAI_API_KEY not configured in .env file
   Please add your OpenAI API key to backend/.env

❌ ANTHROPIC_API_KEY not configured in .env file
   Please add your Anthropic API key to backend/.env

📝 Setup Instructions:
   1. Copy backend/.env.example to backend/.env
   2. Add your OpenAI API key (get from: https://platform.openai.com/api-keys)
   3. Add your Anthropic API key (get from: https://console.anthropic.com/)
   4. Run this test again: node test-ai-apis.js
```

## Common Issues

### Issue: "Invalid API key"
**Solution:** 
- Check that you copied the entire key
- Verify the key is active in your provider's dashboard
- Make sure there are no extra spaces or quotes

### Issue: "Rate limit exceeded"
**Solution:**
- Wait a few minutes and try again
- Check your usage limits in the provider's dashboard
- Consider upgrading your plan if needed

### Issue: "Network error"
**Solution:**
- Check your internet connection
- Verify you're not behind a restrictive firewall
- Try again in a few minutes

### Issue: "Module not found"
**Solution:**
```bash
cd brand-audit-tool/backend
npm install
```

## Cost Estimation

This test makes minimal API calls:

- **OpenAI Test:** ~15 tokens = $0.0005 (less than a penny)
- **Anthropic Test:** ~17 tokens = $0.00005 (negligible)

**Total cost per test:** Less than $0.001 (one-tenth of a penny)

## What Happens in the Brand Audit Tool?

When you run an actual brand audit:

1. **Web Crawler** captures screenshots of the website
2. **OpenAI GPT-4 Vision** analyzes visual elements (colors, layout, images)
3. **Claude 3.5 Sonnet** analyzes content and accessibility
4. **Combined Analysis** generates a comprehensive report

Typical audit cost: $0.10 - $0.50 depending on page complexity and number of pages.

## Using Only One API

You can use the tool with just one API:

- **OpenAI only:** Visual analysis will work, content analysis will be limited
- **Anthropic only:** Content analysis will work, visual analysis will be limited
- **Both APIs:** Full functionality with best results

## Next Steps

After successful API testing:

1. ✅ APIs are configured and working
2. 🚀 Start the backend server: `npm run dev`
3. 🌐 Start the frontend: `cd ../frontend && npm run dev`
4. 🧪 Create your first audit at http://localhost:3000
5. 📊 View results and reports

## Security Best Practices

1. **Never share your API keys**
2. **Set usage limits** in your provider dashboards
3. **Monitor your usage** regularly
4. **Rotate keys** if compromised
5. **Use environment variables** (never hardcode keys)

## Support

- OpenAI Documentation: https://platform.openai.com/docs
- Anthropic Documentation: https://docs.anthropic.com/
- Brand Audit Tool Issues: Check the README.md

---

**Made with Bob** 🤖