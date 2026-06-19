# How to Push Using Your Access Token

You've created your GitHub Personal Access Token - here's how to use it!

## Step-by-Step Instructions

### Step 1: Open Terminal
Open your terminal application (Terminal.app on Mac)

### Step 2: Navigate to Project
```bash
cd /Users/rruggerio/Documents/Projects/0512_BobProject_Baseline/brand-audit-tool
```

### Step 3: Push to GitHub
```bash
git push -u origin main
```

### Step 4: Enter Credentials When Prompted

You'll see prompts like this:

```
Username for 'https://github.com': 
```
**Type:** `rruggerio` and press Enter

```
Password for 'https://rruggerio@github.com':
```
**Paste your token** (it won't show as you paste - that's normal!) and press Enter

### Step 5: Success!

You should see output like:
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

### Step 6: Verify on GitHub
Visit: https://github.com/rruggerio/BrandChecker

You should see all your files! 🎉

## Save Token for Future Use (Optional)

To avoid entering the token every time:

```bash
# Save credentials in macOS Keychain
git config --global credential.helper osxkeychain

# Next time you push, enter token once and it will be saved
```

## Quick Copy-Paste Commands

```bash
# Navigate to project
cd /Users/rruggerio/Documents/Projects/0512_BobProject_Baseline/brand-audit-tool

# Push to GitHub
git push -u origin main

# When prompted:
# Username: rruggerio
# Password: [paste your token]
```

## Important Notes

⚠️ **Your token is like a password:**
- Don't share it
- Don't commit it to code
- Keep it secure
- If lost, create a new one at: https://github.com/settings/tokens

✅ **The token won't display when you paste it** - this is normal security behavior

✅ **Copy the token before closing the GitHub page** - you can't see it again

## Troubleshooting

### "Authentication failed"
- Token might be incorrect
- Make sure you copied the entire token
- Check token has 'repo' scope enabled

### "Permission denied"
- Verify repository exists: https://github.com/rruggerio/BrandChecker
- Check you have write access to the repository

### Token expired
- Create a new token at: https://github.com/settings/tokens
- Use the new token when prompted

## After Successful Push

Your code will be at: **https://github.com/rruggerio/BrandChecker**

You can then:
1. Share the repository with team members
2. Add collaborators in Settings → Collaborators
3. Continue development
4. Make future commits and push with `git push`

## Ready to Push?

Run these commands now:

```bash
cd /Users/rruggerio/Documents/Projects/0512_BobProject_Baseline/brand-audit-tool
git push -u origin main
```

When prompted, enter:
- Username: `rruggerio`
- Password: [your token]

That's it! 🚀