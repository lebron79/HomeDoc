-- Run this in Supabase SQL Editor to enable automatic stock reduction

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
