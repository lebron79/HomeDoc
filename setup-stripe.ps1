#!/usr/bin/env pwsh
<#
.SYNOPSIS
Simple Stripe Payment Setup for HomeDoc

.DESCRIPTION
This script sets up the Stripe PHP payment integration for HomeDoc.
It installs the Stripe PHP SDK and configures environment variables.

.PARAMETER StripeSecretKey
Your Stripe secret key (starts with sk_test_ or sk_live_)

.EXAMPLE
.\setup-stripe.ps1 -StripeSecretKey "sk_test_4eC39HqLyjWDarh..."

#>

param(
    [Parameter(Mandatory=$true)]
    [string]$StripeSecretKey
)

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "HomeDoc - Simple Stripe Setup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Set environment variable
Write-Host "Setting Stripe Secret Key..." -ForegroundColor Yellow
[System.Environment]::SetEnvironmentVariable("STRIPE_SECRET_KEY", $StripeSecretKey, "User")
$env:STRIPE_SECRET_KEY = $StripeSecretKey
Write-Host "✓ Stripe key set successfully!" -ForegroundColor Green
Write-Host ""

# Check for Composer
Write-Host "Checking if Composer is installed..." -ForegroundColor Yellow
$composerExists = $null -ne (Get-Command composer -ErrorAction SilentlyContinue)

if ($composerExists) {
    Write-Host "✓ Composer found!" -ForegroundColor Green
    Write-Host "Installing Stripe PHP SDK..." -ForegroundColor Yellow
    Push-Location "api"
    & composer require stripe/stripe-php
    Pop-Location
    Write-Host "✓ Dependencies installed!" -ForegroundColor Green
} else {
    Write-Host "✗ Composer not found. Installing Stripe PHP SDK manually..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please do one of the following:" -ForegroundColor Cyan
    Write-Host "1. Install Composer from https://getcomposer.org" -ForegroundColor White
    Write-Host "2. Or download Stripe PHP SDK from https://github.com/stripe/stripe-php/releases" -ForegroundColor White
    Write-Host "3. Extract it to api/vendor/ folder" -ForegroundColor White
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Install dependencies: npm install" -ForegroundColor White
Write-Host "2. Add routes to your App.tsx (see SIMPLE_STRIPE_SETUP.md)" -ForegroundColor White
Write-Host "3. Start development server: npm run dev" -ForegroundColor White
Write-Host "4. Start PHP server: php -S localhost:8080" -ForegroundColor White
Write-Host "5. Test payment with SimplePayment component" -ForegroundColor White
Write-Host ""
Write-Host "Need help? See SIMPLE_STRIPE_SETUP.md for detailed instructions." -ForegroundColor Cyan
Write-Host ""
