# Deploy Stripe Edge Functions

Write-Host "Deploying Stripe Checkout Functions..." -ForegroundColor Cyan
Write-Host ""

# Deploy create-checkout-session
Write-Host "Step 1: Deploying create-checkout-session..." -ForegroundColor Yellow
supabase functions deploy create-checkout-session

if ($LASTEXITCODE -eq 0) {
    Write-Host "Success: create-checkout-session deployed!" -ForegroundColor Green
} else {
    Write-Host "Error: Failed to deploy create-checkout-session" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Deploy verify-payment
Write-Host "Step 2: Deploying verify-payment..." -ForegroundColor Yellow
supabase functions deploy verify-payment

if ($LASTEXITCODE -eq 0) {
    Write-Host "Success: verify-payment deployed!" -ForegroundColor Green
} else {
    Write-Host "Error: Failed to deploy verify-payment" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Set your Stripe secret key:" -ForegroundColor Yellow
Write-Host "supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key" -ForegroundColor Cyan
