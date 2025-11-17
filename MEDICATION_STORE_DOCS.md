# Medication E-Commerce System Documentation

## Overview
The Medication E-Commerce system allows doctors to browse and purchase medications for their practice. Admins can manage the medication inventory through the database.

## Database Tables

### 1. `medications`
Stores all available medications in the system.

**Fields:**
- `id` - Unique identifier (UUID)
- `name` - Medication name (e.g., "Amoxicillin")
- `description` - Detailed description
- `category` - Category (e.g., "Antibiotics", "Pain Relief")
- `manufacturer` - Manufacturer name
- `price` - Price in decimal (e.g., 15.99)
- `stock_quantity` - Available stock count
- `image_url` - Optional image URL
- `dosage_form` - Form (e.g., "Tablet", "Capsule", "Syrup")
- `strength` - Strength (e.g., "500mg", "10ml")
- `prescription_required` - Boolean flag
- `active_ingredients` - Active ingredients description
- `side_effects` - Side effects information
- `warnings` - Important warnings
- `is_available` - Boolean flag to show/hide medication

### 2. `medication_orders`
Stores orders placed by doctors.

**Fields:**
- `id` - Order ID
- `doctor_id` - Doctor who placed the order
- `total_amount` - Total order amount
- `status` - Order status (pending, processing, shipped, delivered, cancelled)
- `shipping_address` - Delivery address
- `payment_method` - Payment method used
- `payment_status` - Payment status (pending, paid, failed)
- `notes` - Optional order notes

### 3. `medication_order_items`
Line items for each order.

**Fields:**
- `id` - Item ID
- `order_id` - Reference to order
- `medication_id` - Reference to medication
- `quantity` - Quantity ordered
- `price_at_purchase` - Price at time of purchase
- `subtotal` - Line item subtotal

### 4. `medication_cart`
Shopping cart for doctors.

**Fields:**
- `id` - Cart item ID
- `doctor_id` - Doctor ID
- `medication_id` - Medication ID
- `quantity` - Quantity in cart

## How to Add/Edit Medications (Admin)

### Using Supabase Dashboard

1. **Navigate to Supabase Dashboard**
   - Go to your Supabase project
   - Click on "Table Editor" in the left sidebar
   - Select the `medications` table

2. **Add a New Medication**
   - Click "Insert" → "Insert row"
   - Fill in the required fields:
     - **name**: Medication name
     - **description**: Full description
     - **category**: Choose from existing or add new category
     - **manufacturer**: Company name
     - **price**: Decimal number (e.g., 15.99)
     - **stock_quantity**: Integer (e.g., 500)
     - **dosage_form**: Tablet/Capsule/Syrup/Injection/etc.
     - **strength**: e.g., "500mg", "10ml"
     - **prescription_required**: true/false
     - **active_ingredients**: List of active ingredients
     - **side_effects**: Possible side effects
     - **warnings**: Important safety information
     - **is_available**: true (to make it visible to doctors)
   - Click "Save"

3. **Edit Existing Medication**
   - Click on any row to edit
   - Update the fields as needed
   - Click "Save"

4. **Hide/Remove a Medication**
   - To temporarily hide: Set `is_available` to `false`
   - To permanently delete: Click the row → "Delete" (not recommended if orders exist)

### Sample SQL Insert (Alternative Method)

```sql
INSERT INTO medications (
  name, description, category, manufacturer, price, stock_quantity,
  dosage_form, strength, prescription_required, active_ingredients,
  side_effects, warnings, is_available
) VALUES (
  'Aspirin',
  'Pain reliever and fever reducer, also used for heart health',
  'Pain Relief',
  'BayerPharm',
  7.99,
  1500,
  'Tablet',
  '325mg',
  false,
  'Acetylsalicylic acid',
  'Stomach upset, heartburn, allergic reactions',
  'Do not use if allergic to NSAIDs. Consult doctor if pregnant.',
  true
);
```

## Doctor Features

### For Doctors:
1. **Browse Medications**
   - View all available medications with details
   - Search by name or description
   - Filter by category

2. **Shopping Cart**
   - Add medications to cart
   - Update quantities
   - Remove items

3. **Place Orders**
   - Enter shipping address
   - Select payment method
   - Add order notes
   - Complete purchase

4. **Order Management**
   - View order history (future feature)
   - Track order status (future feature)

## Access Points

### For Doctors:
- **Dashboard Banner**: Large clickable banner on the doctor dashboard
- **Navbar**: "Store" button in the top navigation (green gradient button)
- **Direct URL**: `/medication-store`

### For Admins:
- Manage medications through Supabase Dashboard
- Update order statuses in `medication_orders` table

## Security

- **RLS Policies Enabled**: All tables have Row Level Security
- **Doctors can only**:
  - View available medications
  - Create and view their own orders
  - Manage their own cart
- **Admins can**:
  - Add/edit/delete medications
  - View and update all orders

## Categories (Examples)

Common medication categories:
- Antibiotics
- Pain Relief
- Cardiovascular
- Diabetes
- Gastrointestinal
- Allergy
- Respiratory
- Dermatology
- Mental Health
- Vitamins & Supplements

## Best Practices

1. **Keep stock updated**: Regularly update `stock_quantity` to reflect inventory
2. **Set `is_available` false for out-of-stock items**: Better than deleting
3. **Use clear descriptions**: Help doctors make informed decisions
4. **Include warnings**: Always add relevant medical warnings
5. **Price accuracy**: Double-check prices before adding
6. **Categories**: Use consistent category names for better filtering

## Migration

The database schema is created in:
```
supabase/migrations/20251031000000_create_medication_ecommerce.sql
```

To apply the migration:
```bash
# If using Supabase CLI
supabase db reset

# Or manually run the SQL in Supabase SQL Editor
```

## Sample Data

10 sample medications are included in the migration for testing:
- Amoxicillin (Antibiotic)
- Ibuprofen (Pain Relief)
- Lisinopril (Cardiovascular)
- Metformin (Diabetes)
- Omeprazole (Gastrointestinal)
- Atorvastatin (Cardiovascular)
- Azithromycin (Antibiotic)
- Cetirizine (Allergy)
- Insulin Glargine (Diabetes)
- Salbutamol (Respiratory)

## Future Enhancements

- Order history page for doctors
- Order tracking system
- Admin dashboard for order management
- Email notifications for orders
- Inventory alerts for low stock
- Prescription verification system
- Bulk ordering discounts
- Favorite medications list
- Recommended medications based on practice
