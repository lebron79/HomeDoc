# GitHub Pages Deployment Guide

This guide will help you deploy the HomeDoc application to GitHub Pages.

## Prerequisites

1. GitHub account with access to the `HomeDoc` repository
2. Supabase project set up and running
3. Gemini API key (for AI features)

## Step 1: Prepare Your Repository

### Option A: Replace Existing Repository Content

If you already have a `HomeDoc` repository and want to replace its content:

```powershell
# Navigate to this project directory
cd c:\Users\yassi\Desktop\homedoc\homedoc

# Initialize git if not already done
git init

# Add remote
git remote add origin https://github.com/lebron79/HomeDoc.git

# Fetch the existing repository
git fetch origin

# Force replace with new content
git checkout -b main
git add .
git commit -m "Initial commit: HomeDoc application"
git push -f origin main
```

### Option B: Fresh Repository Setup

If you're starting fresh:

```powershell
cd c:\Users\yassi\Desktop\homedoc\homedoc
git init
git add .
git commit -m "Initial commit: HomeDoc application"
git branch -M main
git remote add origin https://github.com/lebron79/HomeDoc.git
git push -u origin main
```

## Step 2: Configure GitHub Repository Settings

1. Go to your repository on GitHub: `https://github.com/lebron79/HomeDoc`
2. Click on **Settings** tab
3. Scroll to **Pages** section in the left sidebar
4. Under **Source**, select:
   - Source: **GitHub Actions**

## Step 3: Add Required Secrets

You need to add your environment variables as GitHub Secrets:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add the following:

   - **Name:** `VITE_SUPABASE_URL`
     - **Value:** Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
   
   - **Name:** `VITE_SUPABASE_ANON_KEY`
     - **Value:** Your Supabase anonymous/public key
   
   - **Name:** `VITE_GEMINI_API_KEY`
     - **Value:** Your Google Gemini API key

## Step 4: Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Ensure **Source** is set to **GitHub Actions**
3. Wait for the deployment workflow to complete

## Step 5: Configure Supabase for GitHub Pages

You need to update your Supabase project to allow requests from your GitHub Pages domain:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Add your GitHub Pages URL to the **Site URL**:
   - `https://lebron79.github.io/HomeDoc/`
4. Add the same URL to **Redirect URLs**

## Step 6: Deploy

The deployment will happen automatically when you push to the `main` branch.

To manually trigger a deployment:

1. Go to the **Actions** tab in your GitHub repository
2. Click on **Deploy to GitHub Pages** workflow
3. Click **Run workflow** → **Run workflow**

## Step 7: Access Your Application

Once deployed, your application will be available at:
```
https://lebron79.github.io/HomeDoc/
```

## Troubleshooting

### Build Fails

- Check the **Actions** tab for error logs
- Verify all secrets are correctly set
- Ensure all dependencies are listed in `package.json`

### Application Loads but Can't Connect to Supabase

- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` secrets are correct
- Check Supabase dashboard for allowed URLs
- Ensure RLS policies are properly configured

### 404 Errors on Page Refresh

This is normal for SPAs on GitHub Pages. The current configuration handles this with proper routing.

### White Screen or Blank Page

- Check browser console for errors
- Verify the `base` path in `vite.config.ts` matches your repository name
- If your repo name changes, update `base: '/HomeDoc/'` accordingly

## Local Development

To run the project locally:

```powershell
# Install dependencies
npm install

# Create .env file with your keys
# VITE_SUPABASE_URL=your_url
# VITE_SUPABASE_ANON_KEY=your_key
# VITE_GEMINI_API_KEY=your_key

# Run development server
npm run dev
```

## Updating the Deployment

Simply push changes to the `main` branch:

```powershell
git add .
git commit -m "Your commit message"
git push origin main
```

The GitHub Actions workflow will automatically build and deploy your changes.

## Important Notes

1. **Never commit `.env` files** - They are gitignored for security
2. **Use GitHub Secrets** for all sensitive data
3. **Test locally** before pushing to production
4. **Database migrations** must be applied manually to your Supabase project
5. **Custom domain** can be configured in GitHub Pages settings if desired

## Database Setup

Don't forget to apply the database migrations to your Supabase project:

1. Go to Supabase Dashboard → SQL Editor
2. Run all migration files in the `supabase/migrations/` folder in chronological order
3. Verify tables and functions are created properly

## Support

If you encounter issues:
1. Check the GitHub Actions logs for build errors
2. Review browser console for runtime errors
3. Verify all Supabase configurations
4. Ensure all required secrets are set correctly
