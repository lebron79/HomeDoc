import { useState, useEffect } from 'react';
import { getPredictionStatistics, PredictionStatistics } from '../../lib/diseaseApi';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Clock, 
  TrendingUp,
  BarChart3,
  PieChart,
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  User
} from 'lucide-react';

export function ModelFeedbackDashboard() {
  const [stats, setStats] = useState<PredictionStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setLoading(true);
    setError(null);
    const data = await getPredictionStatistics();
    if (data) {
      setStats(data);
    } else {
      setError('Failed to load statistics. Please try again.');
    }
    setLoading(false);
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
        <span className="ml-3 text-gray-600">Loading model feedback statistics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900">{error}</h3>
        <button
          onClick={loadStatistics}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Model Feedback</h2>
          <p className="text-gray-600 mt-1">
            View how well the disease prediction model is performing based on doctor reviews
          </p>
        </div>
        <button
          onClick={loadStatistics}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Predictions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Predictions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_predictions}</p>
            </div>
          </div>
        </div>

        {/* Reviewed */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Reviewed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.reviewed_predictions}</p>
            </div>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending_review}</p>
            </div>
          </div>
        </div>

        {/* Accuracy Rate */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Accuracy Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.accuracy_rate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Accuracy Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Correct vs Incorrect */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600" />
            Prediction Accuracy
          </h3>
          
          <div className="space-y-4">
            {/* Correct */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-green-700">
                  <ThumbsUp className="w-4 h-4" />
                  Correct Predictions
                </span>
                <span className="font-semibold">{stats.correct_predictions}</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{
                    width: `${stats.reviewed_predictions > 0 
                      ? (stats.correct_predictions / stats.reviewed_predictions) * 100 
                      : 0}%`
                  }}
                />
              </div>
            </div>

            {/* Incorrect */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-red-700">
                  <ThumbsDown className="w-4 h-4" />
                  Incorrect Predictions
                </span>
                <span className="font-semibold">{stats.incorrect_predictions}</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all"
                  style={{
                    width: `${stats.reviewed_predictions > 0 
                      ? (stats.incorrect_predictions / stats.reviewed_predictions) * 100 
                      : 0}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-500">Model Accuracy</p>
              <p className={`text-4xl font-bold ${
                stats.accuracy_rate >= 80 ? 'text-green-600' :
                stats.accuracy_rate >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {stats.accuracy_rate}%
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Based on {stats.reviewed_predictions} reviewed predictions
              </p>
            </div>
          </div>
        </div>

        {/* Top Predicted Diseases */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Top Predicted Diseases
          </h3>
          
          {stats.top_predicted_diseases && stats.top_predicted_diseases.length > 0 ? (
            <div className="space-y-3">
              {stats.top_predicted_diseases.map((disease, index) => (
                <div key={disease.predicted_disease} className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {disease.predicted_disease}
                      </span>
                      <span className="text-sm text-gray-500">{disease.count}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{
                          width: `${(disease.count / (stats.top_predicted_diseases[0]?.count || 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No predictions yet</p>
          )}
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          Recent Doctor Feedback
        </h3>

        {stats.recent_feedback && stats.recent_feedback.length > 0 ? (
          <div className="space-y-4">
            {stats.recent_feedback.map((feedback) => (
              <div
                key={feedback.id}
                className={`p-4 rounded-lg border ${
                  feedback.is_correct 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {feedback.is_correct ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="font-medium text-gray-900">
                        {feedback.predicted_disease}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        feedback.is_correct 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {feedback.is_correct ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    
                    {feedback.actual_diagnosis && (
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-medium">Actual diagnosis:</span> {feedback.actual_diagnosis}
                      </p>
                    )}
                    
                    {feedback.doctor_feedback && (
                      <p className="text-sm text-gray-600 italic">
                        "{feedback.doctor_feedback}"
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {feedback.reviewer_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(feedback.reviewed_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No feedback yet. Doctors will review predictions and provide feedback here.
          </p>
        )}
      </div>
    </div>
  );
}
