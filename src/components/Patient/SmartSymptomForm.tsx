import { useState } from 'react';
import { predictDisease, PredictionResult } from '../../lib/diseaseApi';
import { 
  ChevronRight, 
  ChevronLeft,
  Thermometer,
  Activity,
  AlertCircle,
  CheckCircle,
  Loader2,
  Stethoscope,
  Heart,
  Brain,
  Bone,
  Droplets,
  Wind,
  Zap,
  Moon,
  User
} from 'lucide-react';

// Step definitions
interface FormData {
  // Step 1: Basic Info
  age: string;
  gender: string;
  
  // Step 2: Main Symptoms
  mainSymptoms: string[];
  
  // Step 3: Symptom Details
  temperature: string;
  painLevel: string;
  duration: string;
  
  // Step 4: Additional Symptoms
  additionalSymptoms: string[];
  
  // Step 5: Medical History
  hasChronicConditions: boolean;
  chronicConditions: string[];
  currentMedications: string;
}

const initialFormData: FormData = {
  age: '',
  gender: '',
  mainSymptoms: [],
  temperature: '',
  painLevel: '',
  duration: '',
  additionalSymptoms: [],
  hasChronicConditions: false,
  chronicConditions: [],
  currentMedications: '',
};

// Symptom categories
const mainSymptomOptions = [
  { id: 'fever', label: 'Fever', icon: Thermometer },
  { id: 'headache', label: 'Headache', icon: Brain },
  { id: 'fatigue', label: 'Fatigue/Tiredness', icon: Moon },
  { id: 'body_pain', label: 'Body Pain', icon: Bone },
  { id: 'cough', label: 'Cough', icon: Wind },
  { id: 'breathing', label: 'Breathing Issues', icon: Wind },
  { id: 'skin_rash', label: 'Skin Rash/Itching', icon: Droplets },
  { id: 'stomach', label: 'Stomach Issues', icon: Activity },
  { id: 'joint_pain', label: 'Joint Pain', icon: Bone },
  { id: 'chest_pain', label: 'Chest Pain', icon: Heart },
  { id: 'nausea', label: 'Nausea/Vomiting', icon: AlertCircle },
  { id: 'dizziness', label: 'Dizziness', icon: Zap },
];

const additionalSymptomOptions = [
  'Runny nose', 'Sore throat', 'Loss of appetite', 'Weight loss',
  'Sweating', 'Chills', 'Muscle weakness', 'Blurred vision',
  'Frequent urination', 'Excessive thirst', 'Swelling', 'Redness',
  'Itchy eyes', 'Sneezing', 'Nasal congestion', 'Difficulty swallowing',
  'Back pain', 'Neck stiffness', 'Abdominal pain', 'Diarrhea',
  'Constipation', 'Bloating', 'Heartburn', 'Loss of taste/smell',
  'Skin peeling', 'Bruising easily', 'Hair loss', 'Dry skin'
];

const chronicConditionOptions = [
  'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma',
  'Arthritis', 'Thyroid Disorder', 'Kidney Disease', 'Liver Disease'
];

export function SmartSymptomForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const totalSteps = 5;

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'mainSymptoms' | 'additionalSymptoms' | 'chronicConditions', item: string) => {
    setFormData(prev => {
      const array = prev[field];
      if (array.includes(item)) {
        return { ...prev, [field]: array.filter(i => i !== item) };
      } else {
        return { ...prev, [field]: [...array, item] };
      }
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.age && formData.gender;
      case 2:
        return formData.mainSymptoms.length > 0;
      case 3:
        return formData.duration;
      case 4:
        return true; // Optional
      case 5:
        return true; // Optional
      default:
        return false;
    }
  };

  const buildSymptomText = (): string => {
    const parts: string[] = [];
    
    // Age and gender context
    parts.push(`I am a ${formData.age} year old ${formData.gender}.`);
    
    // Main symptoms
    const mainSymptomLabels = formData.mainSymptoms.map(id => 
      mainSymptomOptions.find(o => o.id === id)?.label || id
    );
    if (mainSymptomLabels.length > 0) {
      parts.push(`I am experiencing ${mainSymptomLabels.join(', ').toLowerCase()}.`);
    }
    
    // Temperature
    if (formData.temperature) {
      const tempDescriptions: Record<string, string> = {
        'normal': 'My temperature is normal.',
        'low_fever': 'I have a low-grade fever around 99-100°F.',
        'moderate_fever': 'I have a moderate fever around 101-102°F.',
        'high_fever': 'I have a high fever above 103°F.',
      };
      parts.push(tempDescriptions[formData.temperature] || '');
    }
    
    // Pain level
    if (formData.painLevel) {
      const painDescriptions: Record<string, string> = {
        'none': '',
        'mild': 'The pain is mild and manageable.',
        'moderate': 'The pain is moderate and uncomfortable.',
        'severe': 'The pain is severe and very uncomfortable.',
        'extreme': 'The pain is extreme and unbearable.',
      };
      if (painDescriptions[formData.painLevel]) {
        parts.push(painDescriptions[formData.painLevel]);
      }
    }
    
    // Duration
    if (formData.duration) {
      const durationDescriptions: Record<string, string> = {
        'today': 'These symptoms started today.',
        '2-3_days': 'I have had these symptoms for 2-3 days.',
        'week': 'I have had these symptoms for about a week.',
        '2_weeks': 'I have had these symptoms for about two weeks.',
        'month': 'I have had these symptoms for about a month.',
        'longer': 'I have had these symptoms for more than a month.',
      };
      parts.push(durationDescriptions[formData.duration] || '');
    }
    
    // Additional symptoms
    if (formData.additionalSymptoms.length > 0) {
      parts.push(`I also have ${formData.additionalSymptoms.join(', ').toLowerCase()}.`);
    }
    
    // Chronic conditions
    if (formData.hasChronicConditions && formData.chronicConditions.length > 0) {
      parts.push(`I have a history of ${formData.chronicConditions.join(', ').toLowerCase()}.`);
    }
    
    return parts.filter(p => p).join(' ');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    
    const symptomText = buildSymptomText();
    console.log('Sending to API:', symptomText);
    
    const prediction = await predictDisease(symptomText);
    setResult(prediction);
    setLoading(false);
    setCurrentStep(6); // Results step
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setResult(null);
    setCurrentStep(1);
  };

  // Progress bar
  const progress = ((currentStep - 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Smart Health Assessment
          </h1>
          <p className="text-gray-600">
            Answer a few questions to get an AI-powered health prediction
          </p>
        </div>

        {/* Progress Bar */}
        {currentStep <= totalSteps && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                  <p className="text-sm text-gray-500">Tell us about yourself</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => updateFormData('age', e.target.value)}
                    placeholder="Enter your age"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    min="1"
                    max="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Gender
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Male', 'Female', 'Other'].map((gender) => (
                      <button
                        key={gender}
                        onClick={() => updateFormData('gender', gender.toLowerCase())}
                        className={`py-3 px-4 rounded-xl border-2 transition-all ${
                          formData.gender === gender.toLowerCase()
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {gender}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Main Symptoms */}
          {currentStep === 2 && (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Main Symptoms</h2>
                  <p className="text-sm text-gray-500">Select all that apply</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {mainSymptomOptions.map((symptom) => {
                  const Icon = symptom.icon;
                  const isSelected = formData.mainSymptoms.includes(symptom.id);
                  return (
                    <button
                      key={symptom.id}
                      onClick={() => toggleArrayItem('mainSymptoms', symptom.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <span className={isSelected ? 'text-indigo-700 font-medium' : 'text-gray-700'}>
                        {symptom.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Symptom Details */}
          {currentStep === 3 && (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Symptom Details</h2>
                  <p className="text-sm text-gray-500">Help us understand your symptoms better</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Temperature */}
                {formData.mainSymptoms.includes('fever') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      🌡️ Temperature Level
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'low_fever', label: 'Low Fever (99-100°F)', color: 'yellow' },
                        { id: 'moderate_fever', label: 'Moderate (101-102°F)', color: 'orange' },
                        { id: 'high_fever', label: 'High (103°F+)', color: 'red' },
                        { id: 'normal', label: 'Normal', color: 'green' },
                      ].map((temp) => (
                        <button
                          key={temp.id}
                          onClick={() => updateFormData('temperature', temp.id)}
                          className={`py-3 px-4 rounded-xl border-2 transition-all ${
                            formData.temperature === temp.id
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {temp.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pain Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    😣 Pain Level
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: 'none', label: 'None', emoji: '😊' },
                      { id: 'mild', label: 'Mild', emoji: '😐' },
                      { id: 'moderate', label: 'Moderate', emoji: '😟' },
                      { id: 'severe', label: 'Severe', emoji: '😣' },
                      { id: 'extreme', label: 'Extreme', emoji: '😭' },
                    ].map((pain) => (
                      <button
                        key={pain.id}
                        onClick={() => updateFormData('painLevel', pain.id)}
                        className={`flex-1 py-3 px-2 rounded-xl border-2 transition-all text-center ${
                          formData.painLevel === pain.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{pain.emoji}</div>
                        <div className="text-xs text-gray-600">{pain.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    ⏱️ How long have you had these symptoms?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'today', label: 'Started today' },
                      { id: '2-3_days', label: '2-3 days' },
                      { id: 'week', label: 'About a week' },
                      { id: '2_weeks', label: '~2 weeks' },
                      { id: 'month', label: '~1 month' },
                      { id: 'longer', label: 'More than a month' },
                    ].map((duration) => (
                      <button
                        key={duration.id}
                        onClick={() => updateFormData('duration', duration.id)}
                        className={`py-3 px-4 rounded-xl border-2 transition-all ${
                          formData.duration === duration.id
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {duration.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Additional Symptoms */}
          {currentStep === 4 && (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Additional Symptoms</h2>
                  <p className="text-sm text-gray-500">Select any other symptoms you're experiencing</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {additionalSymptomOptions.map((symptom) => {
                  const isSelected = formData.additionalSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      onClick={() => toggleArrayItem('additionalSymptoms', symptom)}
                      className={`px-4 py-2 rounded-full border-2 transition-all text-sm ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5: Medical History */}
          {currentStep === 5 && (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Medical History</h2>
                  <p className="text-sm text-gray-500">This helps us provide better predictions</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasChronicConditions}
                      onChange={(e) => updateFormData('hasChronicConditions', e.target.checked)}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-gray-700">I have existing medical conditions</span>
                  </label>
                </div>

                {formData.hasChronicConditions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select your conditions
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {chronicConditionOptions.map((condition) => {
                        const isSelected = formData.chronicConditions.includes(condition);
                        return (
                          <button
                            key={condition}
                            onClick={() => toggleArrayItem('chronicConditions', condition)}
                            className={`py-3 px-4 rounded-xl border-2 transition-all text-left ${
                              isSelected
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {condition}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Medications (optional)
                  </label>
                  <textarea
                    value={formData.currentMedications}
                    onChange={(e) => updateFormData('currentMedications', e.target.value)}
                    placeholder="List any medications you're currently taking..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Results */}
          {currentStep === 6 && result && (
            <div className="p-6">
              {result.success ? (
                <div className="space-y-6">
                  {/* Success Header */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Analysis Complete</h2>
                  </div>

                  {/* Disease Result */}
                  <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200">
                    <p className="text-sm text-indigo-600 font-medium mb-2">Predicted Condition</p>
                    <h3 className="text-3xl font-bold text-gray-900 mb-3">
                      {result.disease}
                    </h3>
                    {result.confidence && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Confidence Level</span>
                          <span className="text-sm font-medium text-indigo-600">
                            {result.confidence.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000"
                            style={{ width: `${result.confidence}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-medium text-gray-900 mb-2">Your Symptoms Summary</h4>
                    <p className="text-sm text-gray-600">{buildSymptomText()}</p>
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

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={resetForm}
                      className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                    >
                      Start New Assessment
                    </button>
                    <button
                      onClick={() => window.location.href = '/#/create-case'}
                      className="flex-1 py-3 px-6 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                    >
                      Consult a Doctor
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Analysis Failed</h2>
                  <p className="text-gray-600 mb-6">{result.error}</p>
                  <button
                    onClick={resetForm}
                    className="py-3 px-6 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep <= totalSteps && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between">
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>

              {currentStep < totalSteps ? (
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Get Prediction
                      <CheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Step Indicators */}
        {currentStep <= totalSteps && (
          <div className="flex justify-center gap-2 mt-6">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-all ${
                  step === currentStep
                    ? 'w-8 bg-indigo-600'
                    : step < currentStep
                    ? 'bg-indigo-400'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
