# 🧪 Testing Guide: Stripe Checkout for Medication Store

## Prerequisites Checklist

Before testing, make sure you have:

- [ ] Deployed both Supabase Edge Functions
  ```powershell
  .\deploy-stripe-functions.ps1
  ```

- [ ] Set Stripe Secret Key in Supabase
  ```powershell
  supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key_here
  ```

- [ ] Set Environment Variables in `.env`
  ```env
  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
  VITE_SUPABASE_URL=your_supabase_url
  VITE_SUPABASE_ANON_KEY=your_anon_key
  ```

- [ ] Run your development server
  ```powershell
  npm run dev
  ```

## Test Scenario 1: Successful Payment ✅

### Steps:
1. **Login** as a doctor account
   - If you don't have one, register with role "doctor"

2. **Navigate to Medication Store**
   - Click the green "Medication E-Commerce Store" banner on dashboard
   - OR directly go to `/medication-store`

3. **Browse Medications**
   - You should see a grid of available medications
   - Each card shows: name, price, dosage, stock, etc.

4. **Add Items to Cart**
   - Click "Add to Cart" on 2-3 different medications
   - Notice the cart count badge increasing on the cart button

5. **View Cart**
   - Click the "Cart" button (top right, green)
   - Verify all items are listed correctly
   - Check quantities and prices
   - Try updating quantities with +/- buttons

6. **Proceed to Checkout**
   - Click "Proceed to Checkout" button
   - Fill in shipping address (required)
   - Optionally add order notes
   - Click "Proceed to Payment"

7. **Stripe Checkout Page**
   - You should be redirected to Stripe's checkout page
   - URL should be: `checkout.stripe.com/...`
   - You'll see your items listed

8. **Fill Payment Details**
   Use these **test card** details:
   ```
   Card Number: 4242 4242 4242 4242
   Expiry Date: 12/25 (any future date)
   CVC: 123 (any 3 digits)
   Name: Test Doctor
   ZIP/Postal: 12345 (any 5 digits)
   ```

9. **Complete Payment**
   - Click "Pay" button
   - You should be redirected back to your app

10. **Payment Success Page**
    - You should land on `/payment-success`
    - See a loading spinner briefly
    - Then see "Order Placed Successfully!"
    - Order details should show: Order ID, Total Amount, Status

11. **Verify in Database** (Optional)
    - Go to Supabase Dashboard → Table Editor
    - Check `medication_orders` table - new order should exist
    - Check `medication_order_items` table - order items should exist
    - Check `medication_cart` table - should be empty for this doctor

12. **Return to Store**
    - Click "Continue Shopping"
    - Cart should be empty now

### Expected Results:
- ✅ Smooth redirect to Stripe
- ✅ Payment processes successfully
- ✅ Redirects to success page
- ✅ Order created in database
- ✅ Cart cleared
- ✅ Order ID displayed

---

## Test Scenario 2: Canceled Payment ❌

### Steps:
1. **Repeat steps 1-6** from Scenario 1

2. **On Stripe Checkout Page**
   - Look for a "← Back" link or browser back button
   - Click to cancel payment

3. **Payment Canceled Page**
   - You should land on `/payment-canceled`
   - See "Payment Canceled" message

4. **Return to Store**
   - Click "Return to Store"
   - Your cart items should STILL be there
   - No order created in database

### Expected Results:
- ✅ Can cancel payment
- ✅ Redirects to canceled page
- ✅ Cart items preserved
- ✅ No order created
- ✅ Can try again

---

## Test Scenario 3: Declined Card 💳

### Steps:
1. **Repeat steps 1-6** from Scenario 1

2. **On Stripe Checkout Page**
   Use a **declined test card**:
   ```
   Card Number: 4000 0000 0000 0002
   Expiry: 12/25
   CVC: 123
   ```

3. **Attempt Payment**
   - Click "Pay"
   - Stripe should show error: "Your card was declined"
   - Stay on Stripe checkout page

4. **Try Different Card**
   - Use successful card: `4242 4242 4242 4242`
   - Payment should succeed
   - Redirects to success page

### Expected Results:
- ✅ Card decline handled by Stripe
- ✅ Can retry with different card
- ✅ Success flow works after retry

---

## Test Scenario 4: Missing Shipping Address 📦

### Steps:
1. **Add items to cart**
2. **Click "Proceed to Checkout"**
3. **Leave shipping address empty**
4. **Click "Proceed to Payment"**

### Expected Results:
- ✅ Button should be disabled (can't click)
- ✅ HTML5 validation should show error
- ✅ Can't proceed without address

---

## Test Scenario 5: Empty Cart 🛒

### Steps:
1. **Click cart button with no items**
2. **View empty cart**

### Expected Results:
- ✅ Shows "Your cart is empty" message
- ✅ No checkout button visible

---

## Troubleshooting Common Issues

### Issue: "Failed to create checkout session"
**Solutions:**
- Check browser console for detailed error
- Verify edge function is deployed:
  ```powershell
  supabase functions list
  ```
- Check function logs:
  ```powershell
  supabase functions logs create-checkout-session
  ```

### Issue: Payment stuck on "Redirecting to Stripe..."
**Solutions:**
- Check browser console for errors
- Verify `VITE_STRIPE_PUBLISHABLE_KEY` in .env
- Check if Stripe secret key is set in Supabase

### Issue: Payment successful but no order created
**Solutions:**
- Check verify-payment function logs:
  ```powershell
  supabase functions logs verify-payment
  ```
- Verify database permissions
- Check if doctor profile has correct email

### Issue: "Cannot find name 'Deno'" TypeScript errors
**Don't worry!** These are expected for Deno edge functions. They'll work fine when deployed.

---

## Browser Developer Tools Checklist

### Before Testing, Open DevTools:
1. Press `F12` or `Ctrl+Shift+I`
2. Go to **Console** tab
3. Clear console
4. Keep it open during testing

### What to Watch:
- ✅ No red errors in console
- ✅ Network tab shows successful requests
- ✅ Function calls return 200 status codes

---

## Success Criteria ✨

Your implementation is working correctly if:

1. ✅ Can add items to cart
2. ✅ Cart persists and updates correctly
3. ✅ Checkout requires shipping address
4. ✅ Redirects to Stripe hosted page
5. ✅ Stripe page shows correct items and prices
6. ✅ Can complete payment with test card
7. ✅ Redirects back to success page
8. ✅ Order appears in database
9. ✅ Cart clears after successful payment
10. ✅ Can cancel and retry later
11. ✅ Cart preserved after cancellation

---

## Video Recording Recommendation 📹

For debugging, consider screen recording your test:
- Windows: `Win + G` (Game Bar)
- OBS Studio (free)
- Share recording if you encounter issues

---

## Next Steps After Successful Testing

1. **Switch to Live Mode** (when ready for production):
   - Use live Stripe keys (pk_live_... and sk_live_...)
   - Test with real cards in production

2. **Add Features**:
   - Order history page
   - Order tracking
   - Email notifications
   - Invoice generation

3. **Monitor**:
   - Supabase function logs
   - Stripe dashboard for payments
   - Database for orders

---

**Happy Testing! 🎉**

If you encounter any issues, check the logs first:
```powershell
# Check create-checkout-session logs
supabase functions logs create-checkout-session --tail

# Check verify-payment logs
supabase functions logs verify-payment --tail
```
