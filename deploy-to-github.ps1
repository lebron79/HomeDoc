# HomeDoc GitHub Pages Deployment Script for PowerShell

Write-Host "🚀 Starting GitHub Pages deployment setup..." -ForegroundColor Cyan

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "📦 Initializing git repository..." -ForegroundColor Yellow
    git init
}

# Check for uncommitted changes
$status = git status --porcelain
if ($status) {
    Write-Host "📝 Adding all files..." -ForegroundColor Yellow
    git add .
    
    Write-Host "💾 Committing changes..." -ForegroundColor Yellow
    git commit -m "Prepare for GitHub Pages deployment"
}

# Check if remote exists
$remotes = git remote
if ($remotes -notcontains "origin") {
    Write-Host "🔗 Adding remote origin..." -ForegroundColor Yellow
    $repoUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/lebron79/HomeDoc.git)"
    git remote add origin $repoUrl
} else {
    Write-Host "✅ Remote origin already exists" -ForegroundColor Green
}

# Create main branch if needed
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    Write-Host "🌿 Creating/switching to main branch..." -ForegroundColor Yellow
    git branch -M main
}

# Push to GitHub
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
$forcePush = Read-Host "Do you want to force push? (y/N)"
if ($forcePush -eq "y" -or $forcePush -eq "Y") {
    git push -f origin main
} else {
    git push -u origin main
}

Write-Host ""
Write-Host "✨ Deployment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to your GitHub repository Settings → Pages"
Write-Host "2. Set Source to 'GitHub Actions'"
Write-Host "3. Add required secrets in Settings → Secrets and variables → Actions:"
Write-Host "   - VITE_SUPABASE_URL"
Write-Host "   - VITE_SUPABASE_ANON_KEY"
Write-Host "   - VITE_GEMINI_API_KEY"
Write-Host "4. The GitHub Actions workflow will automatically deploy your app"
Write-Host ""
Write-Host "🌐 Your site will be available at:" -ForegroundColor Cyan
Write-Host "   https://lebron79.github.io/HomeDoc/"
Write-Host ""
