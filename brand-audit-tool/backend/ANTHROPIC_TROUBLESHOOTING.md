# Anthropic API Troubleshooting Guide

## Current Status

✅ **API Key Format**: Verified correct
- Prefix: `sk-ant-api03-`
- Length: 108 characters
- No whitespace or invalid characters
- SDK properly configured

❌ **Issue**: 404 "model not found" errors for all Claude models
- Tried: Haiku, Sonnet 3.5, Sonnet, Opus
- All return: `NotFoundError: 404 {"type":"error","error":{"type":"not_found_error","message":"model: ..."}}`

## Root Cause

The API key is valid and properly formatted, but your account doesn't have access to Claude models yet. This is a common issue with new Anthropic accounts.

## Resolution Steps

### 1. Check Your Anthropic Account Status

Visit the Anthropic Console:
- Go to: https://console.anthropic.com/
- Log in with your account
- Check the "Settings" or "Account" section
- Look for:
  - Account tier/plan
  - Model access permissions
  - Any pending verifications

### 2. Verify Billing Setup

Even with API credits, you may need to:
- Add a payment method
- Set up billing information
- Accept terms of service
- Complete any required verification steps

### 3. Contact Anthropic Support

**Option A: Email Support**
- Email: support@anthropic.com
- Subject: "API Key Valid but Getting 404 Model Not Found Errors"
- Include:
  - Your account email
  - API key prefix (first 20 chars): `sk-ant-api03-J1...`
  - Error message: "404 not_found_error for all Claude models"
  - Models tried: Haiku, Sonnet 3.5, Sonnet, Opus
  - Diagnostic results (all format checks passed)

**Option B: Console Support Chat**
- Visit: https://console.anthropic.com/
- Look for support chat or help icon
- Provide the same information as above

**Option C: Community Forum**
- Visit: https://community.anthropic.com/
- Search for similar issues
- Post your question with diagnostic details

### 4. Request Model Access

Specifically ask Anthropic to:
1. Enable Claude model access on your account
2. Confirm which models you should have access to
3. Verify your API key has proper permissions
4. Check if there are any account restrictions

### 5. Wait for Account Activation

New accounts may require:
- Manual review (24-48 hours)
- Email verification
- Business verification (for enterprise)
- Billing verification

## Testing After Resolution

Once Anthropic confirms your access is enabled, run these tests:

### Test 1: Run Diagnostic Again
```bash
cd brand-audit-tool/backend
node check-anthropic-key.js
```

### Test 2: Test All Models
```bash
node test-ai-apis.js
```

### Test 3: Test Specific Model
```bash
# Set your preferred model in .env
CLAUDE_MODEL=claude-3-5-sonnet-20240620

# Restart backend
npm run dev
```

## Alternative: Use OpenAI While Waiting

Your OpenAI integration is working perfectly. You can:

1. **Proceed with OpenAI only**
   - Use GPT-4 Vision for all analysis
   - Add Claude support later

2. **Modify services to use OpenAI as fallback**
   - Try Claude first
   - Fall back to OpenAI if Claude fails
   - Log which service was used

3. **Make Claude optional**
   - Check if Claude is available before using
   - Skip Claude-specific features if not available

## Common Issues & Solutions

### Issue: "Invalid API Key"
- **Solution**: Key format is correct, this is not your issue

### Issue: "Rate Limit Exceeded"
- **Solution**: Not your issue (you're getting 404, not 429)

### Issue: "Model Not Found" (Your Current Issue)
- **Solution**: Account needs model access enabled by Anthropic

### Issue: "Insufficient Credits"
- **Solution**: Add billing/credits in console

## Model Information

When access is enabled, you should be able to use:

| Model | ID | Best For | Speed | Cost |
|-------|-----|----------|-------|------|
| Haiku | `claude-3-haiku-20240307` | Fast tasks | Fastest | Lowest |
| Sonnet 3.5 | `claude-3-5-sonnet-20240620` | Balanced | Fast | Medium |
| Sonnet | `claude-3-sonnet-20240229` | Balanced | Medium | Medium |
| Opus | `claude-3-opus-20240229` | Complex tasks | Slower | Highest |

## Configuration

Once working, configure your preferred model in `.env`:

```env
# Recommended for brand auditing (good balance of speed/quality)
CLAUDE_MODEL=claude-3-5-sonnet-20240620

# Or for fastest/cheapest
CLAUDE_MODEL=claude-3-haiku-20240307

# Or for highest quality
CLAUDE_MODEL=claude-3-opus-20240229
```

## Next Steps

1. ✅ API key format verified (completed)
2. ⏳ Contact Anthropic support (pending)
3. ⏳ Wait for account activation (pending)
4. ⏳ Test again after activation (pending)
5. ⏳ Configure preferred model (pending)

## Support Resources

- **Anthropic Console**: https://console.anthropic.com/
- **API Documentation**: https://docs.anthropic.com/
- **Community Forum**: https://community.anthropic.com/
- **Support Email**: support@anthropic.com
- **Status Page**: https://status.anthropic.com/

## Questions?

If you need help with any of these steps or want to proceed with OpenAI while waiting, let me know!