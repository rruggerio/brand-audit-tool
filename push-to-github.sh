#!/bin/bash

# Push BrandChecker to GitHub
# Repository: https://github.com/rruggerio/BrandChecker

echo "🚀 Pushing BrandChecker to GitHub..."
echo ""

# Add remote
echo "📡 Adding GitHub remote..."
git remote add origin https://github.com/rruggerio/BrandChecker.git

# Verify remote
echo ""
echo "✅ Remote configured:"
git remote -v

# Push to GitHub
echo ""
echo "⬆️  Pushing to GitHub..."
git push -u origin main

echo ""
echo "✨ Done! Your code is now on GitHub!"
echo "🔗 View at: https://github.com/rruggerio/BrandChecker"

# Made with Bob
