import { useState } from 'react';
import { predictDisease, PredictionResult, checkApiHealth } from '../../lib/diseaseApi';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Stethoscope,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';

export function DiseasePrediction() {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check API health on mount
  useState(() => {
    checkApiHealth().then(isHealthy => {
      setApiStatus(isHealthy ? 'online' : 'offline');
    });
  });

  const handlePredict = async () => {
    if (!symptoms.trim()) return;
    
    setLoading(true);
    setResult(null);
    
    // Pass user ID to save prediction for doctor review
    const prediction = await predictDisease(symptoms, user?.id);
    setResult(prediction);
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePredict();
    }
  };

  const clearResults = () => {
    setSymptoms('');
    setResult(null);
  };

  const exampleSymptoms = [
    'headache, fever, fatigue',
    'cough, sore throat, runny nose',
    'stomach pain, nausea, vomiting',
    'chest pain, shortness of breath',
    'joint pain, swelling, stiffness'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Disease Prediction
          </h1>
          <p className="text-gray-600">
            Enter your symptoms to get an AI-powered preliminary diagnosis
          </p>
          
          {/* API Status */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm
            ${apiStatus === 'online' ? 'bg-green-100 text-green-700' : 
              apiStatus === 'offline' ? 'bg-red-100 text-red-700' : 
              'bg-yellow-100 text-yellow-700'}">
            {apiStatus === 'online' ? (
              <>
                <Wifi className="w-4 h-4" />
                API Online
              </>
            ) : apiStatus === 'offline' ? (
              <>
                <WifiOff className="w-4 h-4" />
                API Offline
              </>
            ) : (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking...
              </>
            )}
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Input Section */}
          <div className="p-6 border-b border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your symptoms
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., headache, fever, fatigue, body aches..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all"
              rows={3}
              disabled={loading}
            />
            
            {/* Example Symptoms */}
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Try these examples:</p>
              <div className="flex flex-wrap gap-2">
                {exampleSymptoms.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setSymptoms(example)}
                    className="text-xs px-3 py-1 bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-700 rounded-full transition-colors"
                    disabled={loading}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handlePredict}
                disabled={loading || !symptoms.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Predict Disease
                  </>
                )}
              </button>
              
              {(symptoms || result) && (
                <button
                  onClick={clearResults}
                  disabled={loading}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className="p-6">
              {result.success ? (
                <div className="space-y-4">
                  {/* Disease Result */}
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-green-600 font-medium">Predicted Condition</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {result.disease}
                      </h3>
                      {result.confidence && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 rounded-full transition-all duration-500"
                                style={{ width: `${result.confidence}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-600">
                              {result.confidence.toFixed(1)}% confidence
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Important Disclaimer</p>
                      <p className="text-sm text-amber-700 mt-1">
                        This is an AI-based prediction and should not replace professional medical advice. 
                        Please consult a healthcare provider for proper diagnosis and treatment.
                      </p>
                    </div>
                  </div>

                  {/* Success indicator */}
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">Prediction completed successfully</span>
                  </div>
                </div>
              ) : (
                /* Error State */
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Prediction Failed</p>
                    <p className="text-sm text-red-700 mt-1">
                      {result.error || 'An unexpected error occurred. Please try again.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 p-4 bg-white/50 backdrop-blur rounded-xl">
          <h3 className="font-medium text-gray-900 mb-2">How it works</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Enter your symptoms separated by commas</li>
            <li>• Our trained ML model analyzes the symptom patterns</li>
            <li>• Get an instant preliminary disease prediction</li>
            <li>• Always consult a doctor for proper diagnosis</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
