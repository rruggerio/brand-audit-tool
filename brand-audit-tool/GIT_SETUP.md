# Git Setup Guide - Brand Audit Tool

This guide will help you connect your project to a Git repository and share it with others.

## Option 1: Create a New GitHub Repository (Recommended)

### Step 1: Initialize Git Locally

```bash
# Navigate to the project directory
cd brand-audit-tool

# Initialize git repository
git init

# Add all files (respects .gitignore)
git add .

# Create initial commit
git commit -m "Initial commit: Brand Compliance Auditing Tool

- Full-stack TypeScript application
- Backend: Node.js + Express + PostgreSQL
- Frontend: React + IBM Carbon Design System
- AI Integration: OpenAI GPT-4 Vision + Anthropic Claude
- Features: Web crawling, brand analysis, reporting
- Documentation: Setup, Quick Start, Project Overview"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `brand-audit-tool` (or your preferred name)
3. Description: "AI-powered brand compliance auditing tool for evaluating website adherence to brand guidelines"
4. Choose: **Private** (recommended for client work) or Public
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### Step 3: Connect and Push

```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/brand-audit-tool.git

# Verify remote
git remote -v

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Verify

Visit your repository at: `https://github.com/YOUR_USERNAME/brand-audit-tool`

## Option 2: Use Existing Repository

If you already have a repository:

```bash
cd brand-audit-tool
git init
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git add .
git commit -m "Add brand audit tool"
git pull origin main --allow-unrelated-histories  # If repo has existing files
git push -u origin main
```

## Option 3: Use GitLab or Bitbucket

### GitLab
```bash
git remote add origin https://gitlab.com/YOUR_USERNAME/brand-audit-tool.git
git push -u origin main
```

### Bitbucket
```bash
git remote add origin https://bitbucket.org/YOUR_USERNAME/brand-audit-tool.git
git push -u origin main
```

## Sharing with Others

### Method 1: Add Collaborators (Private Repo)

**GitHub:**
1. Go to repository Settings → Collaborators
2. Click "Add people"
3. Enter their GitHub username or email
4. Choose permission level (Read, Write, or Admin)

**They can then clone:**
```bash
git clone https://github.com/YOUR_USERNAME/brand-audit-tool.git
cd brand-audit-tool
```

### Method 2: Share Public Repository

If your repo is public, anyone can clone:
```bash
git clone https://github.com/YOUR_USERNAME/brand-audit-tool.git
```

### Method 3: Create a Release/Tag

For stable versions:
```bash
# Create a tag
git tag -a v1.0.0 -m "Version 1.0.0 - Initial Release"

# Push tag
git push origin v1.0.0

# Or push all tags
git push --tags
```

Then share the release URL:
`https://github.com/YOUR_USERNAME/brand-audit-tool/releases/tag/v1.0.0`

## Important: Protect Sensitive Information

### Before Pushing - Security Checklist

✅ **Verify .gitignore is working:**
```bash
# Check what will be committed
git status

# These should NOT appear:
# - .env files
# - node_modules/
# - uploads/
# - logs/
# - screenshots/
# - reports/
```

✅ **Never commit:**
- API keys (OpenAI, Anthropic)
- Database passwords
- JWT secrets
- Any `.env` files

✅ **Safe to commit:**
- `.env.example` (template without real values)
- Source code
- Documentation
- Configuration files

### If You Accidentally Committed Secrets

**Remove from history:**
```bash
# Remove file from git but keep locally
git rm --cached backend/.env

# Commit the removal
git commit -m "Remove .env file from tracking"

# Force push (if already pushed)
git push origin main --force
```

**Then:**
1. Rotate all exposed API keys immediately
2. Change all passwords
3. Update secrets in your local `.env`

## Setting Up for Team Collaboration

### 1. Create Branch Protection Rules

**GitHub Settings → Branches → Add rule:**
- Branch name pattern: `main`
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass
- ✅ Require branches to be up to date

### 2. Create Development Workflow

```bash
# Team members create feature branches
git checkout -b feature/new-analysis-engine

# Make changes and commit
git add .
git commit -m "Add new analysis engine"

# Push feature branch
git push origin feature/new-analysis-engine

# Create Pull Request on GitHub
# After review and approval, merge to main
```

### 3. Set Up CI/CD (Optional)

Create `.github/workflows/ci.yml`:
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

## Cloning Instructions for Team Members

Share these instructions with your team:

### First Time Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/brand-audit-tool.git
cd brand-audit-tool

# 2. Install dependencies
npm run install:all

# 3. Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# 4. Set up database
createdb brand_audit

# 5. Start development servers
npm run dev
```

### Daily Workflow

```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, then commit
git add .
git commit -m "Description of changes"

# Push and create PR
git push origin feature/your-feature-name
```

## Repository Structure Best Practices

### README.md
Your repository should have a clear README (already created) with:
- Project description
- Features
- Installation instructions
- Usage examples
- Contributing guidelines

### Documentation
Keep docs organized:
```
brand-audit-tool/
├── README.md           # Project overview
├── SETUP.md           # Detailed setup
├── QUICKSTART.md      # Quick start guide
├── PROJECT_OVERVIEW.md # Architecture details
├── GIT_SETUP.md       # This file
└── docs/              # Additional docs (future)
```

## Common Git Commands

```bash
# Check status
git status

# View changes
git diff

# View commit history
git log --oneline

# Create branch
git checkout -b branch-name

# Switch branches
git checkout main

# Pull latest changes
git pull

# Push changes
git push

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- filename
```

## Troubleshooting

### "Repository not found"
- Check repository URL
- Verify you have access
- Ensure you're authenticated

### "Permission denied"
- Set up SSH keys or use HTTPS with token
- Check collaborator permissions

### "Merge conflicts"
```bash
# Pull latest changes
git pull origin main

# Resolve conflicts in files
# Then:
git add .
git commit -m "Resolve merge conflicts"
git push
```

### Large files error
```bash
# If you accidentally added large files
git rm --cached path/to/large/file
echo "path/to/large/file" >> .gitignore
git commit -m "Remove large file"
```

## Next Steps

1. ✅ Initialize Git repository
2. ✅ Create GitHub/GitLab repository
3. ✅ Push code
4. ✅ Add collaborators
5. ✅ Share clone instructions
6. ✅ Set up branch protection
7. ✅ Document contribution guidelines

## Quick Reference Card

```bash
# Setup
git init
git remote add origin URL
git push -u origin main

# Daily workflow
git pull                    # Get updates
git checkout -b feature     # New branch
git add .                   # Stage changes
git commit -m "message"     # Commit
git push origin feature     # Push branch

# Collaboration
git fetch                   # Check for updates
git merge origin/main       # Merge updates
git push                    # Share changes
```

---

**Need Help?**
- GitHub Docs: https://docs.github.com
- Git Docs: https://git-scm.com/doc
- GitHub Desktop: https://desktop.github.com (GUI alternative)