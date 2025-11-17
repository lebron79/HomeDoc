# Stripe Payment Flow - Quick Troubleshooting

## 🔴 Error: "Stripe key not configured"

**Cause:** Backend can't find `STRIPE_SECRET_KEY` environment variable

**Solutions:**
1. **Set temporarily** (PowerShell):
   ```powershell
   $env:STRIPE_SECRET_KEY = "sk_test_YOUR_KEY"
   ```

2. **Set permanently** (Windows):
   - Right-click "This PC" → Properties
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Click "New" under User variables
   - Name: `STRIPE_SECRET_KEY`
   - Value: `sk_test_YOUR_KEY`
   - Restart all terminals

3. **Verify it's set**:
   ```powershell
   echo $env:STRIPE_SECRET_KEY
   ```

---

## 🔴 Error: "Failed to create checkout session"

**Cause:** PHP endpoint isn't accessible or has an error

**Solutions:**

1. **Check PHP server is running**:
   ```powershell
   # In new PowerShell window:
   cd c:\Users\yassi\Desktop\homedoc
   php -S localhost:8080
   ```

2. **Check Stripe SDK is installed**:
   ```bash
   cd api
   ls vendor  # Should show a "stripe" folder
   ```
   
   If not:
   ```bash
   composer require stripe/stripe-php
   ```

3. **Test the endpoint directly**:
   ```powershell
   # In PowerShell:
   curl -X POST http://localhost:8080/homedoc/api/create-checkout-session.php `
     -Headers @{'Content-Type'='application/json'} `
     -Body '{"amount":1999,"email":"test@example.com","userId":"123","itemName":"Test"}'
   ```

4. **Check if CORS is the issue**:
   - Look in browser console for CORS errors
   - PHP files already have CORS headers
   - Make sure `VITE_API_URL` matches your server

---

## 🔴 Error: "CORS error" or "request blocked"

**Cause:** Frontend and backend are on different domains/ports without proper headers

**Solution:**
The PHP files already include CORS headers. If still getting errors:

1. **Check your VITE_API_URL** in `.env`:
   ```env
   VITE_API_URL=http://localhost:8080/homedoc/api
   ```

2. **Verify both are running**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8080

3. **Check browser console** for exact error message

---

## 🔴 Error: "Invalid JSON input"

**Cause:** Request body is malformed or empty

**Solution:**
Make sure `SimplePayment` component is being used correctly:

```tsx
<SimplePayment
  amount={1999}
  email={user.email}  // ← Make sure user exists
  userId={user.id}    // ← Make sure user exists
  itemName="Test"
  onPaymentComplete={handleComplete}
/>
```

---

## 🔴 Error: "Missing required fields"

**Cause:** One of these is missing: `amount`, `email`, or `userId`

**Solution:**
Check that:
- ✅ `amount` is provided and > 0
- ✅ `email` is not empty
- ✅ `userId` is not empty
- ✅ User is logged in

```tsx
const { user } = useAuth();

if (!user) {
  return <div>Please log in</div>;
}

<SimplePayment
  amount={1999}
  itemName="Test"
  onPaymentComplete={handlePaymentComplete}
/>
```

---

## 🔴 Error: "Session not found" on verify

**Cause:** Invalid or expired session ID

**Solution:**
1. Make sure URL still has `session_id` parameter
2. Don't manually redirect if verify fails
3. Check that backend is accessible

---

## 🔴 Payment succeeds but doesn't redirect

**Cause:** Browser blocking redirect or callback issue

**Solution:**
1. Check browser console for errors
2. Make sure `onPaymentComplete` callback is defined
3. Try using test card: `4242 4242 4242 4242`

---

## 🔴 Getting "Not Found" when accessing PHP file

**Cause:** File path is wrong or PHP server not running

**Solutions:**

1. **Check PHP server is running**:
   ```powershell
   # You should see:
   # Development Server running at http://127.0.0.1:8080
   ```

2. **Verify file paths**:
   ```
   Working:
   - http://localhost:8080/homedoc/api/create-checkout-session.php
   
   Not working:
   - http://localhost:8080/api/create-checkout-session.php
   - http://localhost:8080/create-checkout-session.php
   ```

3. **Check VITE_API_URL**:
   ```env
   # Should match your PHP server root:
   VITE_API_URL=http://localhost:8080/homedoc/api
   ```

---

## 🔴 "Composer not found"

**Cause:** Composer not installed globally

**Solutions:**

1. **Install Composer** from https://getcomposer.org/download/

2. **Or install SDK manually**:
   - Download from: https://github.com/stripe/stripe-php/releases
   - Extract to: `api/vendor/stripe/`

3. **Or use pre-downloaded vendor folder**:
   - Some hosting includes it already

---

## ✅ Verifying Everything Works

### Step 1: Check Keys
```powershell
# Should output your secret key (partial)
echo $env:STRIPE_SECRET_KEY
```

### Step 2: Check PHP Server
```powershell
# In one terminal:
cd c:\Users\yassi\Desktop\homedoc
php -S localhost:8080

# In another terminal:
curl http://localhost:8080/homedoc/api/create-checkout-session.php
# Should get a JSON error about invalid input (that's OK, means endpoint exists)
```

### Step 3: Check Frontend
```powershell
# In another terminal:
npm run dev
# Should see "Local: http://localhost:5173"
```

### Step 4: Test Payment
1. Go to http://localhost:5173
2. Navigate to your payment page
3. Click "Pay with Stripe"
4. You should be redirected to Stripe checkout
5. Enter test card: `4242 4242 4242 4242`
6. Complete payment
7. Should redirect to success page

---

## 🔧 Debug Mode

### Enable detailed logging:

In `src/lib/payment.ts`, add logging:
```typescript
export async function createCheckoutSession(params: CreateCheckoutParams) {
  console.log('Creating checkout session with:', params);
  
  try {
    const response = await fetch(`${API_BASE_URL}/create-checkout-session.php`, {
      // ... rest of code
    });

    const data = await response.json();
    console.log('Response:', data);
    
    if (!data.success) {
      throw new Error(data.error);
    }

    return { sessionId: data.sessionId, url: data.url };
  } catch (error) {
    console.error('Full error:', error);
    throw error;
  }
}
```

### Check browser network tab:
1. Open Developer Tools (F12)
2. Go to "Network" tab
3. Make a payment
4. Click on the POST request to `create-checkout-session.php`
5. Check:
   - **Status**: Should be 200 (success) or 400 (client error)
   - **Response**: Should be valid JSON
   - **Headers**: Check Content-Type is `application/json`

---

## 📞 Still Stuck?

### Check these files:
- ✅ `SIMPLE_STRIPE_SETUP.md` - Complete setup
- ✅ `STRIPE_ENVIRONMENT_CONFIG.md` - Environment variables
- ✅ `STRIPE_EXAMPLE_BUY_VOTES.md` - Full example

### Common Mistakes:
- ❌ Using live keys in test mode (won't work)
- ❌ Exposing secret key in frontend code
- ❌ Forgetting to set `STRIPE_SECRET_KEY` environment variable
- ❌ PHP server not running on correct port
- ❌ Wrong `VITE_API_URL` configuration
- ❌ Missing Stripe PHP SDK (`composer require stripe/stripe-php`)

### If All Else Fails:
1. Delete `vendor/` folder
2. Run `composer install`
3. Restart PHP server: `php -S localhost:8080`
4. Restart Vite: `npm run dev`
5. Clear browser cache (Ctrl+Shift+Delete)
6. Try again with test card

---

## 🚀 Success Checklist

- [ ] Stripe secret key set in environment
- [ ] Stripe SDK installed (`vendor/stripe/` exists)
- [ ] PHP server running on `localhost:8080`
- [ ] Vite dev server running on `localhost:5173`
- [ ] `.env` has correct `VITE_API_URL`
- [ ] Test payment redirects to Stripe checkout
- [ ] Test payment completes successfully
- [ ] Success page shows after payment
- [ ] Database records payment (if implemented)

You're all set! 🎉
