// Disease Prediction API Service
// Deployed on Render.com

const API_URL = import.meta.env.VITE_DISEASE_API_URL || 'https://homedoc-disease-api.onrender.com';

export interface PredictionResult {
  success: boolean;
  disease?: string;
  confidence?: number;
  error?: string;
}

export async function predictDisease(symptoms: string): Promise<PredictionResult> {
  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symptoms }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Disease prediction error:', error);
    return {
      success: false,
      error: 'Failed to connect to disease prediction service. Please try again later.',
    };
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
