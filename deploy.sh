#!/bin/bash

echo "🚀 StudyBuddy Deployment Script"
echo "================================"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Add all changes
echo "📦 Adding all changes..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Fix deployment configuration for Render

- Update environment variables with actual Render URL
- Fix frontend API calls to use relative paths
- Update CORS configuration for production
- Fix static file serving path
- Update Google OAuth callback URLs
- Improve error handling and database connection
- Update build process configuration"

# Push to GitHub
echo "🔄 Pushing to GitHub..."
git push origin main

echo "✅ Deployment script completed!"
echo ""
echo "Next steps:"
echo "1. Go to your Render dashboard"
echo "2. Trigger a new deployment"
echo "3. Update Google OAuth settings (see GOOGLE_OAUTH_SETUP.md)"
echo "4. Test the deployed application"
echo ""
echo "Your app URL: https://studybuddy-lyni.onrender.com"
