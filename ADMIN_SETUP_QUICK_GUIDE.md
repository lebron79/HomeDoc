# Quick Setup Guide for Admin Medication System

## Step 1: Apply Database Migration

Run the migration to set up the enhanced medication system:

```bash
# Navigate to project directory
cd c:\Users\yassi\Desktop\homedoc\homedoc

# Apply the migration using Supabase CLI
supabase db push
```

Or apply manually in Supabase Dashboard:
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/20251116000000_enhance_medication_system.sql`
4. Click "Run"

## Step 2: Verify Tables Exist

Check that these tables exist:
- ✅ `medications`
- ✅ `medication_orders`
- ✅ `medication_order_items`
- ✅ `medication_cart`

## Step 3: Test Admin Access

1. Login as admin user
2. Navigate to `/admin`
3. You should see 4 tabs:
   - Dashboard
   - Manage Users
   - Medications ← NEW
   - Orders & Revenue ← NEW

## Step 4: Add Your First Medication

1. Click "Medications" tab
2. Click "Add Medication" button
3. Fill in the form:
   ```
   Name: Aspirin
   Manufacturer: Bayer
   Category: Pain Relief
   Dosage Form: Tablet
   Strength: 500mg
   Price: 9.99
   Stock Quantity: 100
   Description: Common pain reliever
   Prescription Required: No
   Available for Sale: Yes
   ```
4. Click "Add Medication"

## Features Available

### Medication Management
- ✅ Add/Edit/Delete medications
- ✅ Search and filter by category
- ✅ Track stock levels
- ✅ Mark as available/unavailable
- ✅ Low stock alerts (<10 units)
- ✅ Out of stock alerts (0 units)

### Order Management
- ✅ View all doctor orders
- ✅ Track revenue (total paid orders)
- ✅ Update order status
- ✅ View order details and items
- ✅ Filter by order status
- ✅ Shipping address tracking

### Dashboard Stats
- Total medications in stock
- Low stock warnings
- Total orders
- Total revenue
- Pending/Completed orders

## Sample Data

The database already includes 10 sample medications:
1. Amoxicillin - Antibiotic
2. Ibuprofen - Pain Relief
3. Lisinopril - Cardiovascular
4. Metformin - Diabetes
5. Omeprazole - Gastrointestinal
6. Atorvastatin - Cardiovascular
7. Azithromycin - Antibiotic
8. Cetirizine - Allergy
9. Insulin Glargine - Diabetes
10. Salbutamol - Respiratory

## Troubleshooting

### Can't see Medications tab?
- Make sure you're logged in as admin
- Check `user_profiles` table: your role should be 'admin'

### Can't add medications?
- Check RLS policies are enabled
- Verify you have admin role
- Check browser console for errors

### Orders not showing?
- Verify `medication_orders` table has data
- Check RLS policy for admin access
- Ensure joins with `user_profiles` work

### Stock not updating?
- Check trigger `trigger_update_stock_on_order` exists
- Verify function `update_medication_stock_on_order()` exists
- Test manually with SQL query

## SQL Quick Checks

### Check if you're admin:
```sql
SELECT id, email, role FROM user_profiles WHERE id = auth.uid();
```

### View all medications:
```sql
SELECT * FROM medications ORDER BY name;
```

### View all orders:
```sql
SELECT o.*, u.full_name, u.email 
FROM medication_orders o
JOIN user_profiles u ON o.doctor_id = u.id
ORDER BY o.created_at DESC;
```

### Get revenue stats:
```sql
SELECT get_order_statistics();
```

### Get low stock items:
```sql
SELECT * FROM get_low_stock_medications(10);
```

## Next Steps

1. ✅ Test adding a medication
2. ✅ Test editing medication stock
3. ✅ Test viewing orders (create a test order first)
4. ✅ Configure Stripe for payments (optional)
5. ✅ Add doctor UI for ordering medications

## Support

For issues, check:
- Browser console for JavaScript errors
- Supabase logs for database errors
- Network tab for API call failures
- RLS policies for permission issues
