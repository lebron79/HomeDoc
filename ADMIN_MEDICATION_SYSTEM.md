# Admin Medication Management System

## Overview

The admin dashboard now includes comprehensive medication management, order tracking, and revenue analytics features.

## Features

### 1. Medication Management (`/admin` → Medications tab)

Admins can:
- ✅ **Add new medications** to the platform
- ✅ **Edit existing medications** (price, stock, details)
- ✅ **Delete medications** from inventory
- ✅ **Manage stock levels** for each medication
- ✅ **Set availability** (mark as available/unavailable)
- ✅ **Search and filter** medications by category
- ✅ **Track low stock** items automatically

#### Medication Fields:
- Name (required)
- Description
- Category (Antibiotics, Pain Relief, Cardiovascular, etc.)
- Manufacturer (required)
- Price (required)
- Stock Quantity (required)
- Dosage Form (Tablet, Capsule, Syrup, etc.)
- Strength (e.g., 500mg, 10ml)
- Image URL (optional)
- Active Ingredients
- Side Effects
- Warnings
- Prescription Required (yes/no)
- Available for Sale (yes/no)

### 2. Order History & Revenue (`/admin` → Orders & Revenue tab)

Admins can:
- ✅ **View all medication orders** from doctors
- ✅ **Track total revenue** from medication sales
- ✅ **Monitor order status** (pending, processing, shipped, delivered, cancelled)
- ✅ **Update order status** directly from the dashboard
- ✅ **View order details** including:
  - Doctor information
  - Order items and quantities
  - Payment status (paid, pending, failed)
  - Shipping address
  - Order date
- ✅ **Filter orders by status**
- ✅ **Calculate statistics**:
  - Total orders
  - Total revenue
  - Pending orders
  - Completed orders

### 3. Dashboard Statistics

The main dashboard shows:
- Total patients
- Total doctors
- Suspended users
- New users this week
- Doctor specializations breakdown
- Platform insights

## Database Structure

### Tables

#### `medications`
Stores all medication inventory:
```sql
- id (UUID, primary key)
- name (VARCHAR)
- description (TEXT)
- category (VARCHAR)
- manufacturer (VARCHAR)
- price (DECIMAL)
- stock_quantity (INTEGER)
- image_url (TEXT, optional)
- dosage_form (VARCHAR)
- strength (VARCHAR)
- prescription_required (BOOLEAN)
- active_ingredients (TEXT)
- side_effects (TEXT)
- warnings (TEXT)
- is_available (BOOLEAN)
- stripe_price_id (VARCHAR, for Stripe integration)
- created_at, updated_at (TIMESTAMP)
```

#### `medication_orders`
Stores doctor orders:
```sql
- id (UUID, primary key)
- doctor_id (UUID, references user_profiles)
- total_amount (DECIMAL)
- status (VARCHAR: pending, processing, shipped, delivered, cancelled)
- payment_status (VARCHAR: pending, paid, failed)
- payment_method (VARCHAR)
- shipping_address (TEXT)
- stripe_session_id (TEXT)
- stripe_payment_intent_id (TEXT)
- notes (TEXT)
- created_at, updated_at (TIMESTAMP)
```

#### `medication_order_items`
Individual items in orders:
```sql
- id (UUID, primary key)
- order_id (UUID, references medication_orders)
- medication_id (UUID, references medications)
- quantity (INTEGER)
- price_at_purchase (DECIMAL)
- subtotal (DECIMAL)
- created_at (TIMESTAMP)
```

## Security (Row Level Security)

### Medications
- ✅ **Everyone** can view available medications
- ✅ **Admin only** can insert, update, delete medications

### Orders
- ✅ **Doctors** can view and create their own orders
- ✅ **Admin** can view and update ALL orders

### Order Items
- ✅ **Doctors** can view their own order items
- ✅ **Admin** can view all order items

## Features Added to Database

### Functions

1. **`get_order_statistics()`**
   - Returns total orders, revenue, pending orders, completed orders
   - Admin-only access

2. **`get_low_stock_medications(threshold)`**
   - Returns medications with stock below threshold
   - Admin-only access

### Triggers

1. **`update_medication_stock_on_order`**
   - Automatically decreases medication stock when order is placed
   - Prevents orders if insufficient stock

## How to Use

### For Admins:

1. **Navigate to Admin Dashboard**
   - Go to `/admin` route
   - Click on "Medications" tab

2. **Add Medication**
   - Click "Add Medication" button
   - Fill in required fields
   - Click "Add Medication" to save

3. **Edit Medication**
   - Click edit icon (pencil) next to any medication
   - Update fields
   - Click "Update Medication"

4. **Manage Stock**
   - Edit medication and update stock quantity
   - Low stock items (<10) are highlighted in yellow
   - Out of stock items (0) are highlighted in red

5. **View Orders**
   - Click "Orders & Revenue" tab
   - View all orders from doctors
   - Filter by status (pending, processing, shipped, delivered)
   - Click expand icon to see order details
   - Change order status using dropdown

6. **Track Revenue**
   - Total revenue from all paid orders is displayed
   - Revenue only counts orders with payment_status = 'paid'

### For Doctors:

- Doctors can browse and order medications (when implemented in doctor dashboard)
- They can only see their own orders
- Payment is processed through Stripe

## Stripe Integration

The system is ready for Stripe payment integration:
- `stripe_session_id` field stores Stripe checkout session
- `stripe_payment_intent_id` tracks payment intent
- `stripe_price_id` in medications table for product pricing

## Migration File

Run this migration to set up the system:
```bash
supabase migration apply 20251116000000_enhance_medication_system.sql
```

Or if already applied, the system uses:
- `20251031000000_create_medication_ecommerce.sql` (base tables)
- `20251116000000_enhance_medication_system.sql` (enhancements)

## Components

### Admin Components

1. **`MedicationManagement.tsx`**
   - Full medication CRUD operations
   - Search and filter functionality
   - Stock tracking
   - Form validation

2. **`OrderHistory.tsx`**
   - Order listing and filtering
   - Revenue statistics
   - Order status management
   - Expandable order details

3. **`AdminDashboard.tsx`** (updated)
   - Added navigation tabs for Medications and Orders
   - Integrated new components

## Sample Categories

- Antibiotics
- Pain Relief
- Cardiovascular
- Diabetes
- Respiratory
- Gastrointestinal
- Allergy
- Vitamins & Supplements
- Dermatology
- Other

## Sample Dosage Forms

- Tablet
- Capsule
- Syrup
- Injection
- Inhaler
- Cream
- Ointment
- Drops
- Spray
- Other

## Notes

- ✅ Sample medications are already inserted in the database
- ✅ Stock levels are automatically updated when orders are placed
- ✅ Low stock alerts are shown in the dashboard
- ✅ All monetary values are stored as DECIMAL for precision
- ✅ Complete audit trail with created_at and updated_at timestamps
- ✅ Proper indexing for fast queries
- ✅ Full RLS security implemented

## Future Enhancements

Potential additions:
- Medication image upload to Supabase Storage
- Bulk import/export of medications
- Automated low stock email notifications
- Sales analytics and charts
- Medication expiry date tracking
- Barcode/QR code generation
- Integration with pharmacy APIs
