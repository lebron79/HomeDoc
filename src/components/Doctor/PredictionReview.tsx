import { useState, useEffect } from 'react';
import { 
  getPendingPredictions, 
  submitPredictionReview, 
  PendingPrediction 
} from '../../lib/diseaseApi';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Clock, 
  User,
  MessageSquare,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Send,
  RefreshCw
} from 'lucide-react';

export function PredictionReview() {
  const [predictions, setPredictions] = useState<PendingPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<{
    [key: string]: {
      isCorrect: boolean | null;
      feedback: string;
      actualDiagnosis: string;
      submitting: boolean;
    };
  }>({});

  useEffect(() => {
    loadPendingPredictions();
  }, []);

  const loadPendingPredictions = async () => {
    setLoading(true);
    const data = await getPendingPredictions();
    setPredictions(data);
    
    // Initialize review data for each prediction
    const initialReviewData: typeof reviewData = {};
    data.forEach(p => {
      initialReviewData[p.id] = {
        isCorrect: null,
        feedback: '',
        actualDiagnosis: '',
        submitting: false,
      };
    });
    setReviewData(initialReviewData);
    setLoading(false);
  };

  const handleReviewSubmit = async (predictionId: string) => {
    const review = reviewData[predictionId];
    if (review.isCorrect === null) {
      alert('Please indicate if the prediction is correct or incorrect');
      return;
    }

    setReviewData(prev => ({
      ...prev,
      [predictionId]: { ...prev[predictionId], submitting: true }
    }));

    const success = await submitPredictionReview(
      predictionId,
      review.isCorrect,
      review.feedback || undefined,
      review.actualDiagnosis || undefined
    );

    if (success) {
      // Remove the reviewed prediction from the list
      setPredictions(prev => prev.filter(p => p.id !== predictionId));
      setExpandedId(null);
    } else {
      alert('Failed to submit review. Please try again.');
      setReviewData(prev => ({
        ...prev,
        [predictionId]: { ...prev[predictionId], submitting: false }
      }));
    }
  };

  const updateReviewData = (
    predictionId: string,
    field: 'isCorrect' | 'feedback' | 'actualDiagnosis',
    value: any
  ) => {
    setReviewData(prev => ({
      ...prev,
      [predictionId]: { ...prev[predictionId], [field]: value }
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="ml-3 text-gray-600">Loading predictions for review...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Review AI Predictions</h2>
          <p className="text-gray-600 mt-1">
            Help improve our AI model by reviewing disease predictions
          </p>
        </div>
        <button
          onClick={loadPendingPredictions}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Summary */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8" />
          <div>
            <p className="text-indigo-100">Pending Reviews</p>
            <p className="text-3xl font-bold">{predictions.length}</p>
          </div>
        </div>
      </div>

      {/* Predictions List */}
      {predictions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">All caught up!</h3>
          <p className="text-gray-600 mt-2">
            There are no predictions waiting for review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {predictions.map((prediction) => (
            <div
              key={prediction.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Prediction Header */}
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === prediction.id ? null : prediction.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                        {prediction.predicted_disease}
                      </span>
                      {prediction.confidence && (
                        <span className="text-sm text-gray-500">
                          {prediction.confidence.toFixed(1)}% confidence
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 line-clamp-2">{prediction.symptoms}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {prediction.patient_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(prediction.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {expandedId === prediction.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Review Form */}
              {expandedId === prediction.id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  {/* Correctness Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Is this prediction correct?
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => updateReviewData(prediction.id, 'isCorrect', true)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-colors ${
                          reviewData[prediction.id]?.isCorrect === true
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                        Correct
                      </button>
                      <button
                        onClick={() => updateReviewData(prediction.id, 'isCorrect', false)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 transition-colors ${
                          reviewData[prediction.id]?.isCorrect === false
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 hover:border-red-300'
                        }`}
                      >
                        <XCircle className="w-5 h-5" />
                        Incorrect
                      </button>
                    </div>
                  </div>

                  {/* Actual Diagnosis (if incorrect) */}
                  {reviewData[prediction.id]?.isCorrect === false && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <AlertTriangle className="w-4 h-4 inline mr-1 text-amber-500" />
                        Actual Diagnosis (optional)
                      </label>
                      <input
                        type="text"
                        value={reviewData[prediction.id]?.actualDiagnosis || ''}
                        onChange={(e) => updateReviewData(prediction.id, 'actualDiagnosis', e.target.value)}
                        placeholder="Enter the correct diagnosis..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  )}

                  {/* Feedback */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      Additional Feedback (optional)
                    </label>
                    <textarea
                      value={reviewData[prediction.id]?.feedback || ''}
                      onChange={(e) => updateReviewData(prediction.id, 'feedback', e.target.value)}
                      placeholder="Add any notes or feedback about this prediction..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={() => handleReviewSubmit(prediction.id)}
                    disabled={reviewData[prediction.id]?.submitting || reviewData[prediction.id]?.isCorrect === null}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {reviewData[prediction.id]?.submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Review
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
