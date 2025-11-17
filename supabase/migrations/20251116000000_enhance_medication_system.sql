-- Add stripe_session_id to medication_orders if not exists
ALTER TABLE medication_orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE medication_orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Create index for faster order lookups
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON medication_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON medication_orders(stripe_session_id);

-- Add RLS policy for admin to view order items
DROP POLICY IF EXISTS "Admin can view all order items" ON medication_order_items;
CREATE POLICY "Admin can view all order items"
  ON medication_order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to get order statistics (for admin dashboard)
CREATE OR REPLACE FUNCTION get_order_statistics()
RETURNS TABLE (
  total_orders BIGINT,
  total_revenue NUMERIC,
  pending_orders BIGINT,
  completed_orders BIGINT,
  total_medications_sold BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_orders,
    COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0)::NUMERIC as total_revenue,
    COUNT(CASE WHEN status = 'pending' THEN 1 END)::BIGINT as pending_orders,
    COUNT(CASE WHEN status = 'delivered' THEN 1 END)::BIGINT as completed_orders,
    (SELECT COALESCE(SUM(quantity), 0)::BIGINT FROM medication_order_items)::BIGINT as total_medications_sold
  FROM medication_orders;
END;
$$;

-- Function to get low stock medications
CREATE OR REPLACE FUNCTION get_low_stock_medications(stock_threshold INT DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  stock_quantity INT,
  category VARCHAR,
  price NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  RETURN QUERY
  SELECT 
    m.id,
    m.name,
    m.stock_quantity,
    m.category,
    m.price
  FROM medications m
  WHERE m.stock_quantity <= stock_threshold AND m.stock_quantity > 0
  ORDER BY m.stock_quantity ASC;
END;
$$;

-- Function to update medication stock after order
CREATE OR REPLACE FUNCTION update_medication_stock_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Decrease stock when order item is created
  IF TG_OP = 'INSERT' THEN
    UPDATE medications
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.medication_id;
    
    -- Check if stock is sufficient
    IF (SELECT stock_quantity FROM medications WHERE id = NEW.medication_id) < 0 THEN
      RAISE EXCEPTION 'Insufficient stock for medication';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for stock update
DROP TRIGGER IF EXISTS trigger_update_stock_on_order ON medication_order_items;
CREATE TRIGGER trigger_update_stock_on_order
  AFTER INSERT ON medication_order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_medication_stock_on_order();

-- Add comment to tables for documentation
COMMENT ON TABLE medications IS 'Stores medication inventory managed by admin';
COMMENT ON TABLE medication_orders IS 'Stores doctor medication orders with payment info';
COMMENT ON TABLE medication_order_items IS 'Individual items in each medication order';
COMMENT ON COLUMN medication_orders.stripe_session_id IS 'Stripe checkout session ID for payment tracking';
COMMENT ON COLUMN medication_orders.stripe_payment_intent_id IS 'Stripe payment intent ID';
