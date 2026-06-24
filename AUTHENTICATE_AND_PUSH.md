# Authenticate and Push to GitHub

Your code is ready to push, but you need to authenticate with GitHub first.

## Current Status
- ✅ Git repository initialized
- ✅ 3 commits ready
- ✅ Remote configured: https://github.com/rruggerio/BrandChecker.git
- ❌ Not yet authenticated

## Choose Your Authentication Method

### Option 1: GitHub CLI (Recommended - Easiest)

```bash
# Install GitHub CLI if not installed
# macOS:
brew install gh

# Authenticate
gh auth login

# Follow prompts:
# - Choose: GitHub.com
# - Choose: HTTPS
# - Authenticate with: Login with a web browser
# - Copy the code and press Enter

# Then push
cd brand-audit-tool
git push -u origin main
```

### Option 2: Personal Access Token (Classic Method)

**Step 1: Create Token**
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name: "BrandChecker Push"
4. Expiration: 90 days (or your preference)
5. Select scopes: ✅ repo (all)
6. Click "Generate token"
7. **COPY THE TOKEN** (you won't see it again!)

**Step 2: Push with Token**
```bash
cd brand-audit-tool

# Push (will prompt for credentials)
git push -u origin main

# When prompted:
# Username: rruggerio
# Password: [paste your token here]
```

**Step 3: Save Credentials (Optional)**
```bash
# Save credentials so you don't need to enter them again
git config --global credential.helper osxkeychain
```

### Option 3: SSH Key (Most Secure)

**Step 1: Generate SSH Key**
```bash
# Generate new SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Press Enter to accept default location
# Enter passphrase (optional but recommended)

# Start SSH agent
eval "$(ssh-agent -s)"

# Add key to agent
ssh-add ~/.ssh/id_ed25519
```

**Step 2: Add to GitHub**
```bash
# Copy public key
cat ~/.ssh/id_ed25519.pub

# Go to: https://github.com/settings/keys
# Click "New SSH key"
# Title: "BrandChecker Mac"
# Paste the key
# Click "Add SSH key"
```

**Step 3: Change Remote to SSH**
```bash
cd brand-audit-tool

# Remove HTTPS remote
git remote remove origin

# Add SSH remote
git remote add origin git@github.com:rruggerio/BrandChecker.git

# Push
git push -u origin main
```

## Quick Start (Recommended)

**If you have GitHub CLI:**
```bash
gh auth login
cd brand-audit-tool
git push -u origin main
```

**If you don't have GitHub CLI:**
1. Create Personal Access Token (see Option 2 above)
2. Run:
```bash
cd brand-audit-tool
git push -u origin main
# Enter username: rruggerio
# Enter password: [paste token]
```

## After Successful Push

You'll see output like:
```
Enumerating objects: 35, done.
Counting objects: 100% (35/35), done.
Delta compression using up to 8 threads
Compressing objects: 100% (32/32), done.
Writing objects: 100% (35/35), 45.67 KiB | 4.57 MiB/s, done.
Total 35 (delta 2), reused 0 (delta 0), pack-reused 0
To https://github.com/rruggerio/BrandChecker.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

Then visit: **https://github.com/rruggerio/BrandChecker** 🎉

## Troubleshooting

### "Authentication failed"
- Token expired or incorrect
- Create new token with 'repo' scope

### "Permission denied (publickey)"
- SSH key not added to GitHub
- Follow Option 3 steps above

### "Repository not found"
- Check repository exists: https://github.com/rruggerio/BrandChecker
- Verify you have access to it

## Need Help?

**Check authentication status:**
```bash
# For GitHub CLI
gh auth status

# For SSH
ssh -T git@github.com
```

**Test connection:**
```bash
# HTTPS
git ls-remote https://github.com/rruggerio/BrandChecker.git

# SSH
git ls-remote git@github.com:rruggerio/BrandChecker.git
```

## What to Do Now

1. **Choose authentication method** (GitHub CLI recommended)
2. **Authenticate** following steps above
3. **Push your code:**
   ```bash
   cd brand-audit-tool
   git push -u origin main
   ```
4. **Verify** at https://github.com/rruggerio/BrandChecker

Your code is ready - you just need to authenticate! 🚀