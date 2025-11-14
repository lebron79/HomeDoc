import { HealthAssessmentForm, HealthAssessment } from '../components/Patient/HealthAssessmentForm';
import { ParticlesBackground } from '../components/Layout/ParticlesBackground';
import { Footer } from '../components/Layout/Footer';
import { Navbar } from '../components/Layout/Navbar';
import { Stethoscope, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HealthAssessmentPage() {
  const navigate = useNavigate();

  const handleSubmit = (assessment: HealthAssessment) => {
    // The form will handle the AI analysis and show results
    // Just navigate back to dashboard after completion
    console.log('Assessment submitted:', assessment);
  };

  const handleCancel = () => {
    navigate('/patient-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 relative">
      <ParticlesBackground />
      <Navbar />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-rose-600 text-white py-12 shadow-xl">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => navigate('/patient-dashboard')}
              className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Dashboard</span>
            </button>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Stethoscope className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Comprehensive Health Assessment
                </h1>
                <p className="text-red-100 text-lg">
                  AI-Powered Symptom Analysis & Health Evaluation
                </p>
              </div>
            </div>
            <p className="text-red-50 mt-4 max-w-2xl">
              Get instant insights about your symptoms with our advanced AI system. 
              Answer a few questions to receive a comprehensive health assessment and personalized recommendations.
            </p>
          </div>
        </div>

        {/* Assessment Form */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-red-100 overflow-hidden">
            <HealthAssessmentForm onSubmit={handleSubmit} onCancel={handleCancel} />
          </div>
        </div>

        {/* Info Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI-Powered Analysis</h3>
              <p className="text-sm text-gray-600">
                Advanced machine learning algorithms analyze your symptoms to provide accurate health insights.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Instant Results</h3>
              <p className="text-sm text-gray-600">
                Get immediate feedback and recommendations based on your symptoms and medical history.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Private & Secure</h3>
              <p className="text-sm text-gray-600">
                Your health information is encrypted and protected with enterprise-grade security.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
