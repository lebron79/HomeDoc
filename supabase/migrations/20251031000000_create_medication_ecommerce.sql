-- Create medications table (managed by admin)
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  manufacturer VARCHAR(255),
  price DECIMAL(10, 2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  dosage_form VARCHAR(100), -- tablet, capsule, syrup, injection, etc.
  strength VARCHAR(100), -- e.g., "500mg", "10ml"
  prescription_required BOOLEAN DEFAULT true,
  active_ingredients TEXT,
  side_effects TEXT,
  warnings TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medication orders table
CREATE TABLE IF NOT EXISTS medication_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
  shipping_address TEXT NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order items table (for items in each order)
CREATE TABLE IF NOT EXISTS medication_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES medication_orders(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shopping cart table
CREATE TABLE IF NOT EXISTS medication_cart (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(doctor_id, medication_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medications_category ON medications(category);
CREATE INDEX IF NOT EXISTS idx_medications_available ON medications(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_doctor ON medication_orders(doctor_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON medication_orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON medication_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_doctor ON medication_cart(doctor_id);

-- Enable Row Level Security
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_cart ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medications (everyone can read, only admin can modify)
CREATE POLICY "Anyone can view available medications"
  ON medications FOR SELECT
  USING (is_available = true);

CREATE POLICY "Admin can insert medications"
  ON medications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update medications"
  ON medications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can delete medications"
  ON medications FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for medication_orders (doctors can only see their own orders)
CREATE POLICY "Doctors can view their own orders"
  ON medication_orders FOR SELECT
  USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can create their own orders"
  ON medication_orders FOR INSERT
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update their own pending orders"
  ON medication_orders FOR UPDATE
  USING (doctor_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admin can view all orders"
  ON medication_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admin can update any order"
  ON medication_orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for medication_order_items
CREATE POLICY "Users can view their own order items"
  ON medication_order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM medication_orders
      WHERE medication_orders.id = order_id
      AND medication_orders.doctor_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can insert order items for their orders"
  ON medication_order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM medication_orders
      WHERE medication_orders.id = order_id
      AND medication_orders.doctor_id = auth.uid()
    )
  );

-- RLS Policies for medication_cart
CREATE POLICY "Doctors can view their own cart"
  ON medication_cart FOR SELECT
  USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can add to their cart"
  ON medication_cart FOR INSERT
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update their cart"
  ON medication_cart FOR UPDATE
  USING (doctor_id = auth.uid());

CREATE POLICY "Doctors can delete from their cart"
  ON medication_cart FOR DELETE
  USING (doctor_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medication_orders_updated_at
  BEFORE UPDATE ON medication_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medication_cart_updated_at
  BEFORE UPDATE ON medication_cart
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample medications (for testing)
INSERT INTO medications (name, description, category, manufacturer, price, stock_quantity, dosage_form, strength, prescription_required, active_ingredients, side_effects, warnings)
VALUES
  ('Amoxicillin', 'Broad-spectrum antibiotic used to treat bacterial infections', 'Antibiotics', 'PharmaCorp', 15.99, 500, 'Capsule', '500mg', true, 'Amoxicillin trihydrate', 'Nausea, diarrhea, allergic reactions', 'Do not use if allergic to penicillin'),
  ('Ibuprofen', 'Nonsteroidal anti-inflammatory drug (NSAID) for pain and fever', 'Pain Relief', 'MediCare', 8.99, 1000, 'Tablet', '400mg', false, 'Ibuprofen', 'Stomach upset, dizziness, rash', 'Take with food to reduce stomach irritation'),
  ('Lisinopril', 'ACE inhibitor for treating high blood pressure', 'Cardiovascular', 'HeartMed', 12.50, 300, 'Tablet', '10mg', true, 'Lisinopril dihydrate', 'Dizziness, dry cough, fatigue', 'Monitor blood pressure regularly'),
  ('Metformin', 'Medication for type 2 diabetes management', 'Diabetes', 'DiabCare', 18.75, 400, 'Tablet', '500mg', true, 'Metformin hydrochloride', 'Diarrhea, nausea, vitamin B12 deficiency', 'Take with meals to reduce GI side effects'),
  ('Omeprazole', 'Proton pump inhibitor for acid reflux and GERD', 'Gastrointestinal', 'GastroHealth', 14.25, 600, 'Capsule', '20mg', false, 'Omeprazole magnesium', 'Headache, stomach pain, gas', 'Take before meals for best effect'),
  ('Atorvastatin', 'Statin medication for lowering cholesterol', 'Cardiovascular', 'HeartMed', 22.00, 250, 'Tablet', '20mg', true, 'Atorvastatin calcium', 'Muscle pain, liver enzyme elevation', 'Avoid grapefruit juice while taking'),
  ('Azithromycin', 'Macrolide antibiotic for respiratory infections', 'Antibiotics', 'PharmaCorp', 19.99, 350, 'Tablet', '250mg', true, 'Azithromycin dihydrate', 'Diarrhea, nausea, abdominal pain', 'Complete full course even if feeling better'),
  ('Cetirizine', 'Antihistamine for allergy relief', 'Allergy', 'AllergyFree', 9.50, 800, 'Tablet', '10mg', false, 'Cetirizine hydrochloride', 'Drowsiness, dry mouth', 'May cause drowsiness in some patients'),
  ('Insulin Glargine', 'Long-acting insulin for diabetes', 'Diabetes', 'DiabCare', 95.00, 100, 'Injection', '100 units/mL', true, 'Insulin glargine', 'Hypoglycemia, injection site reactions', 'Monitor blood glucose regularly'),
  ('Salbutamol', 'Bronchodilator for asthma and COPD', 'Respiratory', 'BreathEasy', 25.00, 200, 'Inhaler', '100mcg', true, 'Salbutamol sulfate', 'Tremor, rapid heartbeat, headache', 'Use as prescribed, do not exceed recommended dose');
