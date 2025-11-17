import { useState } from 'react';
import { Heart, Brain, Activity, Thermometer, Droplet, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

interface HealthAssessmentFormProps {
  onSubmit: (assessment: HealthAssessment) => void;
  onCancel: () => void;
}

export interface HealthAssessment {
  // Personal Information
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number;
  height: number;
  
  // Current Symptoms
  symptoms: string[];
  symptomDuration: string;
  symptomSeverity: 'mild' | 'moderate' | 'severe';
  
  // Medical History
  hasChronicConditions: boolean;
  chronicConditions: string[];
  currentMedications: string[];
  allergies: string[];
  
  // Lifestyle Factors
  smokingStatus: 'never' | 'former' | 'current';
  alcoholConsumption: 'none' | 'light' | 'moderate' | 'heavy';
  exerciseFrequency: 'none' | 'light' | 'moderate' | 'intense';
  sleepHours: number;
  stressLevel: 'low' | 'moderate' | 'high';
  
  // Recent Changes
  recentTravel: boolean;
  recentIllness: boolean;
  recentMedicationChanges: boolean;
  
  // Additional Information
  additionalNotes: string;
}

export function HealthAssessmentForm({ onSubmit, onCancel }: HealthAssessmentFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<HealthAssessment>>({
    symptoms: [],
    chronicConditions: [],
    currentMedications: [],
    allergies: [],
  });

  const totalSteps = 6;

  const updateFormData = (field: keyof HealthAssessment, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addToArray = (field: keyof HealthAssessment, value: string) => {
    const currentArray = (formData[field] as string[]) || [];
    if (!currentArray.includes(value)) {
      updateFormData(field, [...currentArray, value]);
    }
  };

  const removeFromArray = (field: keyof HealthAssessment, value: string) => {
    const currentArray = (formData[field] as string[]) || [];
    updateFormData(field, currentArray.filter(item => item !== value));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (formData.age && formData.gender && formData.symptoms && formData.symptoms.length > 0) {
      onSubmit(formData as HealthAssessment);
    }
  };

  const commonSymptoms = [
    'Fever', 'Cough', 'Headache', 'Nausea', 'Fatigue', 'Dizziness',
    'Shortness of breath', 'Chest pain', 'Abdominal pain', 'Muscle aches',
    'Sore throat', 'Runny nose', 'Diarrhea', 'Vomiting', 'Rash',
    'Joint pain', 'Back pain', 'Insomnia', 'Anxiety', 'Depression'
  ];

  const chronicConditions = [
    'Diabetes', 'Hypertension', 'Heart disease', 'Asthma', 'COPD',
    'Arthritis', 'Depression', 'Anxiety', 'Thyroid disorder', 'Kidney disease',
    'Liver disease', 'Cancer', 'Epilepsy', 'Migraine', 'Other'
  ];

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Heart className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
        <p className="text-gray-600">Let's start with some basic information about you</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
          <input
            type="number"
            value={formData.age || ''}
            onChange={(e) => updateFormData('age', parseInt(e.target.value))}
            required
            min="1"
            max="120"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter your age"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
          <select
            value={formData.gender || ''}
            onChange={(e) => updateFormData('gender', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
          <input
            type="number"
            value={formData.weight || ''}
            onChange={(e) => updateFormData('weight', parseFloat(e.target.value))}
            min="20"
            max="300"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter your weight"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
          <input
            type="number"
            value={formData.height || ''}
            onChange={(e) => updateFormData('height', parseInt(e.target.value))}
            min="100"
            max="250"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter your height"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Thermometer className="w-16 h-16 text-orange-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Current Symptoms</h2>
        <p className="text-gray-600">Tell us about your current health concerns</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-4">Select your symptoms (you can choose multiple)</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {commonSymptoms.map((symptom) => (
            <button
              key={symptom}
              type="button"
              onClick={() => {
                const currentSymptoms = formData.symptoms || [];
                if (currentSymptoms.includes(symptom)) {
                  removeFromArray('symptoms', symptom);
                } else {
                  addToArray('symptoms', symptom);
                }
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                formData.symptoms?.includes(symptom)
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">How long have you had these symptoms?</label>
          <select
            value={formData.symptomDuration || ''}
            onChange={(e) => updateFormData('symptomDuration', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Select duration</option>
            <option value="less than 24 hours">Less than 24 hours</option>
            <option value="1-3 days">1-3 days</option>
            <option value="4-7 days">4-7 days</option>
            <option value="1-2 weeks">1-2 weeks</option>
            <option value="2-4 weeks">2-4 weeks</option>
            <option value="more than 1 month">More than 1 month</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Severity of symptoms</label>
          <select
            value={formData.symptomSeverity || ''}
            onChange={(e) => updateFormData('symptomSeverity', e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Select severity</option>
            <option value="mild">Mild - Noticeable but manageable</option>
            <option value="moderate">Moderate - Affecting daily activities</option>
            <option value="severe">Severe - Significantly impacting daily life</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Brain className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Medical History</h2>
        <p className="text-gray-600">Help us understand your medical background</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-4">
          Do you have any chronic medical conditions?
        </label>
        <div className="flex gap-4 mb-6">
          <label className="flex items-center">
            <input
              type="radio"
              name="hasChronicConditions"
              checked={formData.hasChronicConditions === true}
              onChange={() => updateFormData('hasChronicConditions', true)}
              className="mr-2"
            />
            Yes
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="hasChronicConditions"
              checked={formData.hasChronicConditions === false}
              onChange={() => updateFormData('hasChronicConditions', false)}
              className="mr-2"
            />
            No
          </label>
        </div>

        {formData.hasChronicConditions && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-4">Select your conditions</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {chronicConditions.map((condition) => (
                <button
                  key={condition}
                  type="button"
                  onClick={() => {
                    const currentConditions = formData.chronicConditions || [];
                    if (currentConditions.includes(condition)) {
                      removeFromArray('chronicConditions', condition);
                    } else {
                      addToArray('chronicConditions', condition);
                    }
                  }}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.chronicConditions?.includes(condition)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Current medications (separate with commas)</label>
          <textarea
            value={formData.currentMedications?.join(', ') || ''}
            onChange={(e) => updateFormData('currentMedications', e.target.value.split(',').map(m => m.trim()).filter(m => m))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={3}
            placeholder="e.g., Metformin, Lisinopril"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Known allergies (separate with commas)</label>
          <textarea
            value={formData.allergies?.join(', ') || ''}
            onChange={(e) => updateFormData('allergies', e.target.value.split(',').map(a => a.trim()).filter(a => a))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows={3}
            placeholder="e.g., Penicillin, Shellfish"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Activity className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Lifestyle Factors</h2>
        <p className="text-gray-600">Your lifestyle choices can impact your health</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Smoking status</label>
          <select
            value={formData.smokingStatus || ''}
            onChange={(e) => updateFormData('smokingStatus', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Select status</option>
            <option value="never">Never smoked</option>
            <option value="former">Former smoker</option>
            <option value="current">Current smoker</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Alcohol consumption</label>
          <select
            value={formData.alcoholConsumption || ''}
            onChange={(e) => updateFormData('alcoholConsumption', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Select frequency</option>
            <option value="none">None</option>
            <option value="light">Light (1-2 drinks/week)</option>
            <option value="moderate">Moderate (3-7 drinks/week)</option>
            <option value="heavy">Heavy (8+ drinks/week)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Exercise frequency</label>
          <select
            value={formData.exerciseFrequency || ''}
            onChange={(e) => updateFormData('exerciseFrequency', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Select frequency</option>
            <option value="none">None</option>
            <option value="light">Light (1-2 times/week)</option>
            <option value="moderate">Moderate (3-4 times/week)</option>
            <option value="intense">Intense (5+ times/week)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Average sleep hours per night</label>
          <input
            type="number"
            value={formData.sleepHours || ''}
            onChange={(e) => updateFormData('sleepHours', parseInt(e.target.value))}
            min="1"
            max="24"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="e.g., 7"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Current stress level</label>
          <select
            value={formData.stressLevel || ''}
            onChange={(e) => updateFormData('stressLevel', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">Select level</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Changes</h2>
        <p className="text-gray-600">Any recent changes that might affect your health?</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
          <div>
            <h3 className="font-semibold text-gray-900">Recent travel</h3>
            <p className="text-sm text-gray-600">Have you traveled recently?</p>
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.recentTravel || false}
              onChange={(e) => updateFormData('recentTravel', e.target.checked)}
              className="mr-2"
            />
            Yes
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
          <div>
            <h3 className="font-semibold text-gray-900">Recent illness</h3>
            <p className="text-sm text-gray-600">Have you been sick recently?</p>
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.recentIllness || false}
              onChange={(e) => updateFormData('recentIllness', e.target.checked)}
              className="mr-2"
            />
            Yes
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
          <div>
            <h3 className="font-semibold text-gray-900">Medication changes</h3>
            <p className="text-sm text-gray-600">Any recent changes to your medications?</p>
          </div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.recentMedicationChanges || false}
              onChange={(e) => updateFormData('recentMedicationChanges', e.target.checked)}
              className="mr-2"
            />
            Yes
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Additional notes</label>
        <textarea
          value={formData.additionalNotes || ''}
          onChange={(e) => updateFormData('additionalNotes', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
          rows={4}
          placeholder="Any other information you'd like to share..."
        />
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Information</h2>
        <p className="text-gray-600">Please review your information before submitting</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
          <p className="text-sm text-gray-600">
            Age: {formData.age}, Gender: {formData.gender}, Weight: {formData.weight}kg, Height: {formData.height}cm
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Symptoms</h3>
          <p className="text-sm text-gray-600">
            {formData.symptoms?.join(', ') || 'None selected'}
          </p>
          <p className="text-sm text-gray-600">
            Duration: {formData.symptomDuration}, Severity: {formData.symptomSeverity}
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Medical History</h3>
          <p className="text-sm text-gray-600">
            Chronic conditions: {formData.chronicConditions?.join(', ') || 'None'}
          </p>
          <p className="text-sm text-gray-600">
            Medications: {formData.currentMedications?.join(', ') || 'None'}
          </p>
          <p className="text-sm text-gray-600">
            Allergies: {formData.allergies?.join(', ') || 'None'}
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Lifestyle</h3>
          <p className="text-sm text-gray-600">
            Smoking: {formData.smokingStatus}, Alcohol: {formData.alcoholConsumption}, 
            Exercise: {formData.exerciseFrequency}, Sleep: {formData.sleepHours} hours, 
            Stress: {formData.stressLevel}
          </p>
        </div>

        {formData.additionalNotes && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Additional Notes</h3>
            <p className="text-sm text-gray-600">{formData.additionalNotes}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return renderStep1();
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      {renderCurrentStep()}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={currentStep === 1 ? onCancel : prevStep}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
        >
          {currentStep === 1 ? 'Cancel' : 'Previous'}
        </button>

        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={nextStep}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            Submit Assessment
            <CheckCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
