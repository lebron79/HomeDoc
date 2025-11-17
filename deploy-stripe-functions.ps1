# Stripe Checkout Deployment Script for PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploying Stripe Checkout Functions" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
Write-Host "Checking Supabase CLI..." -ForegroundColor Yellow
try {
    $supabaseVersion = supabase --version
    Write-Host "✓ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Supabase CLI not found!" -ForegroundColor Red
    Write-Host "Please install it from: https://supabase.com/docs/guides/cli" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 1: Deploying create-checkout-session" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    supabase functions deploy create-checkout-session
    Write-Host ""
    Write-Host "✓ create-checkout-session deployed successfully!" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to deploy create-checkout-session" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 2: Deploying verify-payment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    supabase functions deploy verify-payment
    Write-Host ""
    Write-Host "✓ verify-payment deployed successfully!" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to deploy verify-payment" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Step 3: Checking Secrets" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Listing current secrets..." -ForegroundColor Yellow
supabase secrets list

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Verify your Stripe secret key is set:" -ForegroundColor White
Write-Host "   supabase secrets set STRIPE_SECRET_KEY=sk_test_..." -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Make sure your .env file has:" -ForegroundColor White
Write-Host "   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_..." -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Test the flow:" -ForegroundColor White
Write-Host "   - Login as a doctor" -ForegroundColor Cyan
Write-Host "   - Go to Medication Store" -ForegroundColor Cyan
Write-Host "   - Add items to cart" -ForegroundColor Cyan
Write-Host "   - Proceed to checkout" -ForegroundColor Cyan
Write-Host "   - Use test card: 4242 4242 4242 4242" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Check function logs if needed:" -ForegroundColor White
Write-Host "   supabase functions logs create-checkout-session" -ForegroundColor Cyan
Write-Host "   supabase functions logs verify-payment" -ForegroundColor Cyan
Write-Host ""

Write-Host "Happy testing!" -ForegroundColor Green
