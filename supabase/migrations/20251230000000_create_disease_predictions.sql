-- Migration: Create Disease Predictions Table with Doctor Feedback
-- This table stores all AI disease predictions for doctor review and model improvement

-- Create disease predictions table
CREATE TABLE IF NOT EXISTS disease_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    symptoms TEXT NOT NULL,
    predicted_disease VARCHAR(255) NOT NULL,
    confidence DECIMAL(5, 2),
    
    -- Doctor feedback fields
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    is_correct BOOLEAN,
    doctor_feedback TEXT,
    actual_diagnosis VARCHAR(255),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_disease_predictions_user_id ON disease_predictions(user_id);
CREATE INDEX idx_disease_predictions_reviewed_by ON disease_predictions(reviewed_by);
CREATE INDEX idx_disease_predictions_created_at ON disease_predictions(created_at DESC);
CREATE INDEX idx_disease_predictions_is_correct ON disease_predictions(is_correct);
CREATE INDEX idx_disease_predictions_pending_review ON disease_predictions(reviewed_at) WHERE reviewed_at IS NULL;

-- Enable RLS
ALTER TABLE disease_predictions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own predictions
CREATE POLICY "Users can view own predictions"
    ON disease_predictions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own predictions
CREATE POLICY "Users can insert own predictions"
    ON disease_predictions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Doctors can view all predictions for review
CREATE POLICY "Doctors can view all predictions"
    ON disease_predictions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'doctor'
        )
    );

-- Policy: Doctors can update predictions with their feedback
CREATE POLICY "Doctors can review predictions"
    ON disease_predictions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'doctor'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'doctor'
        )
    );

-- Policy: Admins have full access
CREATE POLICY "Admins have full access to predictions"
    ON disease_predictions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Function to get prediction statistics for admin dashboard
CREATE OR REPLACE FUNCTION get_prediction_statistics()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- Check if user is admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin only';
    END IF;

    SELECT json_build_object(
        'total_predictions', (SELECT COUNT(*) FROM disease_predictions),
        'reviewed_predictions', (SELECT COUNT(*) FROM disease_predictions WHERE reviewed_at IS NOT NULL),
        'pending_review', (SELECT COUNT(*) FROM disease_predictions WHERE reviewed_at IS NULL),
        'correct_predictions', (SELECT COUNT(*) FROM disease_predictions WHERE is_correct = true),
        'incorrect_predictions', (SELECT COUNT(*) FROM disease_predictions WHERE is_correct = false),
        'accuracy_rate', (
            SELECT ROUND(
                COALESCE(
                    (COUNT(*) FILTER (WHERE is_correct = true)::DECIMAL / 
                    NULLIF(COUNT(*) FILTER (WHERE reviewed_at IS NOT NULL), 0)) * 100,
                    0
                ), 2
            )
            FROM disease_predictions
        ),
        'top_predicted_diseases', (
            SELECT json_agg(row_to_json(t))
            FROM (
                SELECT predicted_disease, COUNT(*) as count
                FROM disease_predictions
                GROUP BY predicted_disease
                ORDER BY count DESC
                LIMIT 10
            ) t
        ),
        'recent_feedback', (
            SELECT json_agg(row_to_json(t))
            FROM (
                SELECT 
                    dp.id,
                    dp.predicted_disease,
                    dp.is_correct,
                    dp.doctor_feedback,
                    dp.actual_diagnosis,
                    dp.reviewed_at,
                    up.full_name as reviewer_name
                FROM disease_predictions dp
                LEFT JOIN user_profiles up ON dp.reviewed_by = up.id
                WHERE dp.reviewed_at IS NOT NULL
                ORDER BY dp.reviewed_at DESC
                LIMIT 10
            ) t
        )
    ) INTO result;

    RETURN result;
END;
$$;

-- Function for doctors to get pending predictions
CREATE OR REPLACE FUNCTION get_pending_predictions(p_limit INT DEFAULT 20, p_offset INT DEFAULT 0)
RETURNS TABLE(
    prediction_id UUID,
    symptoms TEXT,
    predicted_disease VARCHAR(255),
    confidence DECIMAL(5, 2),
    patient_name VARCHAR(255),
    prediction_created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user is doctor or admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('doctor', 'admin')
    ) THEN
        RAISE EXCEPTION 'Access denied: Doctors and Admins only';
    END IF;

    RETURN QUERY
    SELECT 
        dp.id AS prediction_id,
        dp.symptoms,
        dp.predicted_disease,
        dp.confidence,
        COALESCE(up.full_name, 'Anonymous')::VARCHAR(255) AS patient_name,
        dp.created_at AS prediction_created_at
    FROM disease_predictions dp
    LEFT JOIN user_profiles up ON dp.user_id = up.id
    WHERE dp.reviewed_at IS NULL
    ORDER BY dp.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- Function for doctors to submit review
CREATE OR REPLACE FUNCTION submit_prediction_review(
    p_prediction_id UUID,
    p_is_correct BOOLEAN,
    p_feedback TEXT DEFAULT NULL,
    p_actual_diagnosis VARCHAR(255) DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user is doctor or admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles
        WHERE id = auth.uid() AND role IN ('doctor', 'admin')
    ) THEN
        RAISE EXCEPTION 'Access denied: Doctors and Admins only';
    END IF;

    UPDATE disease_predictions
    SET 
        reviewed_by = auth.uid(),
        reviewed_at = NOW(),
        is_correct = p_is_correct,
        doctor_feedback = p_feedback,
        actual_diagnosis = p_actual_diagnosis,
        updated_at = NOW()
    WHERE id = p_prediction_id AND reviewed_at IS NULL;

    RETURN FOUND;
END;
$$;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_disease_predictions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_disease_predictions_updated_at
    BEFORE UPDATE ON disease_predictions
    FOR EACH ROW
    EXECUTE FUNCTION update_disease_predictions_updated_at();
