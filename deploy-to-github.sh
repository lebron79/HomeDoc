#!/bin/bash

# HomeDoc GitHub Pages Deployment Script

echo "🚀 Starting GitHub Pages deployment setup..."

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Adding all files..."
    git add .
    
    echo "💾 Committing changes..."
    git commit -m "Prepare for GitHub Pages deployment"
fi

# Check if remote exists
if ! git remote | grep -q origin; then
    echo "🔗 Adding remote origin..."
    read -p "Enter your GitHub repository URL (e.g., https://github.com/lebron79/HomeDoc.git): " REPO_URL
    git remote add origin "$REPO_URL"
else
    echo "✅ Remote origin already exists"
fi

# Create main branch if needed
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "🌿 Creating/switching to main branch..."
    git branch -M main
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
read -p "Do you want to force push? (y/N): " FORCE_PUSH
if [ "$FORCE_PUSH" = "y" ] || [ "$FORCE_PUSH" = "Y" ]; then
    git push -f origin main
else
    git push -u origin main
fi

echo ""
echo "✨ Deployment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your GitHub repository Settings → Pages"
echo "2. Set Source to 'GitHub Actions'"
echo "3. Add required secrets in Settings → Secrets and variables → Actions:"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo "   - VITE_GEMINI_API_KEY"
echo "4. The GitHub Actions workflow will automatically deploy your app"
echo ""
echo "🌐 Your site will be available at:"
echo "   https://lebron79.github.io/HomeDoc/"
echo ""
