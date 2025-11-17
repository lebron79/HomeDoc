import { useState, useEffect } from 'react';
import { HealthAssessment } from './HealthAssessmentForm';
import { 
  CheckCircle, 
  AlertTriangle, 
  Heart, 
  Brain, 
  Activity, 
  Thermometer,
  Clock,
  User,
  Calendar,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface HealthPredictionProps {
  assessment: HealthAssessment;
  onBack: () => void;
  onNewAssessment: () => void;
}

interface HealthPrediction {
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: 'self-care' | 'doctor-visit' | 'urgent-care' | 'emergency';
  confidence: number;
  possibleConditions: Array<{
    name: string;
    probability: number;
    description: string;
  }>;
  recommendations: string[];
  warningSigns: string[];
  followUpActions: string[];
}

export function HealthPrediction({ assessment, onBack, onNewAssessment }: HealthPredictionProps) {
  const [prediction, setPrediction] = useState<HealthPrediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI analysis
    const analyzeAssessment = () => {
      setTimeout(() => {
        const result = generateHealthPrediction(assessment);
        setPrediction(result);
        setLoading(false);
      }, 2000);
    };

    analyzeAssessment();
  }, [assessment]);

  const generateHealthPrediction = (assessment: HealthAssessment): HealthPrediction => {
    const { symptoms, symptomSeverity, age, hasChronicConditions, chronicConditions } = assessment;
    
    // Risk assessment logic
    let riskScore = 0;
    let possibleConditions: Array<{ name: string; probability: number; description: string }> = [];
    let recommendations: string[] = [];
    let warningSigns: string[] = [];
    let followUpActions: string[] = [];

    // Age factor
    if (age > 65) riskScore += 2;
    else if (age > 50) riskScore += 1;

    // Symptom severity
    if (symptomSeverity === 'severe') riskScore += 3;
    else if (symptomSeverity === 'moderate') riskScore += 2;
    else if (symptomSeverity === 'mild') riskScore += 1;

    // Chronic conditions
    if (hasChronicConditions) {
      riskScore += 2;
      if (chronicConditions.includes('Heart disease') || chronicConditions.includes('Diabetes')) {
        riskScore += 2;
      }
    }

    // Symptom-based analysis
    const hasFever = symptoms.includes('Fever');
    const hasChestPain = symptoms.includes('Chest pain');
    const hasShortnessOfBreath = symptoms.includes('Shortness of breath');
    const hasSevereHeadache = symptoms.includes('Headache') && symptomSeverity === 'severe';

    if (hasFever && hasChestPain) {
      possibleConditions.push({
        name: 'Respiratory Infection',
        probability: 75,
        description: 'Possible bacterial or viral respiratory infection requiring medical attention.'
      });
      riskScore += 3;
    }

    if (hasChestPain && hasShortnessOfBreath) {
      possibleConditions.push({
        name: 'Cardiac Concern',
        probability: 60,
        description: 'Symptoms may indicate heart-related issues requiring immediate evaluation.'
      });
      riskScore += 4;
      warningSigns.push('Chest pain with shortness of breath');
    }

    if (hasFever && symptoms.includes('Cough')) {
      possibleConditions.push({
        name: 'Upper Respiratory Infection',
        probability: 80,
        description: 'Common viral or bacterial infection of the upper respiratory tract.'
      });
      riskScore += 2;
    }

    if (hasSevereHeadache) {
      possibleConditions.push({
        name: 'Migraine or Tension Headache',
        probability: 70,
        description: 'Severe headache that may require pain management.'
      });
      riskScore += 1;
    }

    if (symptoms.includes('Nausea') && symptoms.includes('Vomiting')) {
      possibleConditions.push({
        name: 'Gastroenteritis',
        probability: 65,
        description: 'Inflammation of the stomach and intestines, often viral.'
      });
      riskScore += 1;
    }

    // Default conditions if no specific matches
    if (possibleConditions.length === 0) {
      possibleConditions.push({
        name: 'General Illness',
        probability: 50,
        description: 'Non-specific symptoms that may resolve with rest and self-care.'
      });
    }

    // Generate recommendations based on risk score
    let riskLevel: 'low' | 'medium' | 'high';
    let recommendation: 'self-care' | 'doctor-visit' | 'urgent-care' | 'emergency';

    if (riskScore >= 7) {
      riskLevel = 'high';
      recommendation = 'urgent-care';
      recommendations = [
        'Seek medical attention within 24 hours',
        'Monitor symptoms closely',
        'Rest and stay hydrated',
        'Avoid strenuous activities'
      ];
      warningSigns = [
        'Severe symptoms',
        'Multiple concerning symptoms',
        'High-risk patient profile'
      ];
      followUpActions = [
        'Schedule urgent care appointment',
        'Monitor vital signs',
        'Prepare medical history for doctor visit'
      ];
    } else if (riskScore >= 4) {
      riskLevel = 'medium';
      recommendation = 'doctor-visit';
      recommendations = [
        'Schedule a doctor appointment within 3-5 days',
        'Monitor symptoms for any changes',
        'Rest and maintain good hydration',
        'Consider over-the-counter symptom relief'
      ];
      followUpActions = [
        'Call your primary care physician',
        'Monitor symptoms daily',
        'Prepare list of current medications'
      ];
    } else {
      riskLevel = 'low';
      recommendation = 'self-care';
      recommendations = [
        'Rest and stay hydrated',
        'Monitor symptoms for 2-3 days',
        'Use over-the-counter medications as needed',
        'Maintain good sleep hygiene'
      ];
      followUpActions = [
        'Monitor symptoms for improvement',
        'Seek care if symptoms worsen',
        'Maintain healthy lifestyle habits'
      ];
    }

    return {
      riskLevel,
      recommendation,
      confidence: Math.min(95, 60 + (riskScore * 5)),
      possibleConditions,
      recommendations,
      warningSigns,
      followUpActions
    };
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'emergency': return <AlertTriangle className="w-6 h-6 text-red-600" />;
      case 'urgent-care': return <AlertTriangle className="w-6 h-6 text-orange-600" />;
      case 'doctor-visit': return <User className="w-6 h-6 text-blue-600" />;
      case 'self-care': return <Heart className="w-6 h-6 text-green-600" />;
      default: return <Heart className="w-6 h-6 text-gray-600" />;
    }
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'emergency': return 'Seek Emergency Care';
      case 'urgent-care': return 'Urgent Care Recommended';
      case 'doctor-visit': return 'Doctor Visit Recommended';
      case 'self-care': return 'Self-Care Sufficient';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Health Assessment</h2>
          <p className="text-gray-600">Our AI is processing your information to provide personalized recommendations...</p>
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {getRecommendationIcon(prediction.recommendation)}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Health Assessment Results
          </h1>
          <p className="text-gray-600">
            Based on your symptoms and medical history
          </p>
        </div>

        {/* Risk Level and Recommendation */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className={`p-6 rounded-xl border-2 ${getRiskColor(prediction.riskLevel)}`}>
            <h3 className="text-lg font-semibold mb-2">Risk Level</h3>
            <p className="text-2xl font-bold capitalize">{prediction.riskLevel}</p>
            <p className="text-sm mt-2">Confidence: {prediction.confidence}%</p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Recommendation</h3>
            <p className="text-xl font-bold text-blue-700">
              {getRecommendationText(prediction.recommendation)}
            </p>
          </div>
        </div>

        {/* Warning Signs */}
        {prediction.warningSigns.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Warning Signs
            </h3>
            <ul className="space-y-2">
              {prediction.warningSigns.map((sign, index) => (
                <li key={index} className="text-red-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  {sign}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Possible Conditions */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Brain className="w-6 h-6 text-blue-600" />
          Possible Conditions
        </h2>
        <div className="space-y-4">
          {prediction.possibleConditions.map((condition, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{condition.name}</h3>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {condition.probability}% probability
                </span>
              </div>
              <p className="text-gray-600">{condition.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-green-600" />
          Recommendations
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Immediate Actions</h3>
            <ul className="space-y-3">
              {prediction.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow-up Actions</h3>
            <ul className="space-y-3">
              {prediction.followUpActions.map((action, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assessment
        </button>

        <button
          onClick={onNewAssessment}
          className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          New Assessment
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Important Disclaimer</h3>
            <p className="text-yellow-800 text-sm">
              This assessment is for informational purposes only and should not replace professional medical advice. 
              If you experience severe symptoms, chest pain, difficulty breathing, or any life-threatening condition, 
              seek emergency medical care immediately. Always consult with a qualified healthcare provider for proper diagnosis and treatment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
