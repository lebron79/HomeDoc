# Quick Deployment Commands

## Initial Setup (First Time Only)

```powershell
# 1. Navigate to project directory
cd c:\Users\yassi\Desktop\homedoc\homedoc

# 2. Run the deployment script
.\deploy-to-github.ps1

# Or manually:
git init
git add .
git commit -m "Initial commit: HomeDoc application"
git branch -M main
git remote add origin https://github.com/lebron79/HomeDoc.git
git push -u origin main
```

## After Pushing to GitHub

1. **Enable GitHub Pages:**
   - Go to: https://github.com/lebron79/HomeDoc/settings/pages
   - Set **Source** to: **GitHub Actions**

2. **Add Secrets:**
   - Go to: https://github.com/lebron79/HomeDoc/settings/secrets/actions
   - Add these secrets:
     - `VITE_SUPABASE_URL` = Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key
     - `VITE_GEMINI_API_KEY` = Your Gemini API key

3. **Update Supabase:**
   - Supabase Dashboard → Authentication → URL Configuration
   - Add to Site URL: `https://lebron79.github.io/HomeDoc/`
   - Add to Redirect URLs: `https://lebron79.github.io/HomeDoc/`

## Your Live Site

Once deployed, access at: **https://lebron79.github.io/HomeDoc/**

## Future Updates

```powershell
git add .
git commit -m "Your update message"
git push origin main
```

Auto-deploys on every push to `main` branch!
