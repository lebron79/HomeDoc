@echo off
REM Simple Stripe Payment Setup Script for Windows

echo ====================================
echo HomeDoc - Simple Stripe Setup
echo ====================================
echo.

REM Check if Stripe key is provided
if "%1"=="" (
    echo Usage: setup-stripe.bat YOUR_STRIPE_SECRET_KEY
    echo Example: setup-stripe.bat sk_test_4eC39HqLyjWDarh...
    echo.
    echo To get your Stripe secret key:
    echo 1. Go to https://dashboard.stripe.com
    echo 2. Click Developers (top right)
    echo 3. Click API Keys
    echo 4. Copy your Secret Key (starts with sk_test_ or sk_live_)
    exit /b 1
)

echo Setting Stripe Secret Key...
setx STRIPE_SECRET_KEY %1
echo ✓ Stripe key set successfully!
echo.

echo Checking if Composer is installed...
where composer >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ Composer not found. Installing Stripe PHP SDK manually...
    echo.
    echo Please do one of the following:
    echo 1. Install Composer from https://getcomposer.org
    echo 2. Or download Stripe PHP SDK from https://github.com/stripe/stripe-php/releases
    echo 3. Extract it to api/vendor/ folder
    echo.
) else (
    echo ✓ Composer found!
    echo Installing Stripe PHP SDK...
    cd api
    call composer require stripe/stripe-php
    cd ..
    echo ✓ Dependencies installed!
)

echo.
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo Next steps:
echo 1. Install dependencies: npm install
echo 2. Add routes to your App.tsx (see SIMPLE_STRIPE_SETUP.md)
echo 3. Start development server: npm run dev
echo 4. Start PHP server in another terminal: php -S localhost:8080
echo 5. Test payment with SimplePayment component
echo.
pause
