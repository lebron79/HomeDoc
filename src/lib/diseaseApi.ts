// Disease Prediction API Service
// Deployed on Render.com

import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_DISEASE_API_URL || 'https://homedoc-disease-api.onrender.com';

export interface PredictionResult {
  success: boolean;
  disease?: string;
  confidence?: number;
  error?: string;
  predictionId?: string; // ID of saved prediction in database
}

export interface SavedPrediction {
  id: string;
  symptoms: string;
  predicted_disease: string;
  confidence: number | null;
  created_at: string;
  reviewed_at: string | null;
  is_correct: boolean | null;
  doctor_feedback: string | null;
  actual_diagnosis: string | null;
}

export interface PendingPrediction {
  id: string;
  symptoms: string;
  predicted_disease: string;
  confidence: number | null;
  patient_name: string;
  created_at: string;
}

export interface PredictionStatistics {
  total_predictions: number;
  reviewed_predictions: number;
  pending_review: number;
  correct_predictions: number;
  incorrect_predictions: number;
  accuracy_rate: number;
  top_predicted_diseases: Array<{ predicted_disease: string; count: number }>;
  recent_feedback: Array<{
    id: string;
    predicted_disease: string;
    is_correct: boolean;
    doctor_feedback: string | null;
    actual_diagnosis: string | null;
    reviewed_at: string;
    reviewer_name: string;
  }>;
}

export async function predictDisease(symptoms: string, userId?: string): Promise<PredictionResult> {
  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symptoms }),
    });

    const data = await response.json();
    
    // If prediction was successful and we have a userId, save to database
    if (data.success && userId) {
      const savedPrediction = await savePrediction(
        userId,
        symptoms,
        data.disease,
        data.confidence
      );
      if (savedPrediction) {
        data.predictionId = savedPrediction.id;
      }
    }
    
    return data;
  } catch (error) {
    console.error('Disease prediction error:', error);
    return {
      success: false,
      error: 'Failed to connect to disease prediction service. Please try again later.',
    };
  }
}

// Save prediction to database for doctor review
export async function savePrediction(
  userId: string,
  symptoms: string,
  predictedDisease: string,
  confidence?: number
): Promise<{ id: string } | null> {
  try {
    const { data, error } = await supabase
      .from('disease_predictions')
      .insert({
        user_id: userId,
        symptoms,
        predicted_disease: predictedDisease,
        confidence: confidence || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving prediction:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error saving prediction:', error);
    return null;
  }
}

// Get user's prediction history
export async function getUserPredictions(userId: string): Promise<SavedPrediction[]> {
  try {
    const { data, error } = await supabase
      .from('disease_predictions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching predictions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return [];
  }
}

// Get pending predictions for doctor review
export async function getPendingPredictions(limit = 20, offset = 0): Promise<PendingPrediction[]> {
  try {
    const { data, error } = await supabase.rpc('get_pending_predictions', {
      p_limit: limit,
      p_offset: offset,
    });

    if (error) {
      console.error('Error fetching pending predictions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching pending predictions:', error);
    return [];
  }
}

// Submit doctor review for a prediction
export async function submitPredictionReview(
  predictionId: string,
  isCorrect: boolean,
  feedback?: string,
  actualDiagnosis?: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('submit_prediction_review', {
      p_prediction_id: predictionId,
      p_is_correct: isCorrect,
      p_feedback: feedback || null,
      p_actual_diagnosis: actualDiagnosis || null,
    });

    if (error) {
      console.error('Error submitting review:', error);
      return false;
    }

    return data;
  } catch (error) {
    console.error('Error submitting review:', error);
    return false;
  }
}

// Get prediction statistics for admin
export async function getPredictionStatistics(): Promise<PredictionStatistics | null> {
  try {
    const { data, error } = await supabase.rpc('get_prediction_statistics');

    if (error) {
      console.error('Error fetching statistics:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return null;
  }
}

// Health check for the API
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000) 
    });
    return response.ok;
  } catch {
    return false;
  }
}
