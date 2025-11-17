import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  AlertCircle, 
  FileText, 
  Activity,
  AlertTriangle,
  Clock,
  Loader2,
  CheckCircle,
  ChevronDown
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ParticlesBackground } from '../Layout/ParticlesBackground';
import { Footer } from '../Layout/Footer';

interface CaseReason {
  value: string;
  label: string;
  emergencyLevel: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

const CASE_REASONS: CaseReason[] = [
  {
    value: 'general_consultation',
    label: 'General Consultation',
    emergencyLevel: 'low',
    description: 'Non-urgent medical advice or general health questions'
  },
  {
    value: 'follow_up',
    label: 'Follow-up Visit',
    emergencyLevel: 'low',
    description: 'Follow-up on previous consultation or treatment'
  },
  {
    value: 'medication_inquiry',
    label: 'Medication Inquiry',
    emergencyLevel: 'low',
    description: 'Questions about medications or prescriptions'
  },
  {
    value: 'mild_symptoms',
    label: 'Mild Symptoms',
    emergencyLevel: 'medium',
    description: 'Mild pain, discomfort, or symptoms that need attention'
  },
  {
    value: 'persistent_symptoms',
    label: 'Persistent Symptoms',
    emergencyLevel: 'medium',
    description: 'Symptoms lasting several days or recurring issues'
  },
  {
    value: 'acute_pain',
    label: 'Acute Pain',
    emergencyLevel: 'high',
    description: 'Severe pain or sudden onset of symptoms'
  },
  {
    value: 'high_fever',
    label: 'High Fever',
    emergencyLevel: 'high',
    description: 'High temperature, severe flu-like symptoms'
  },
  {
    value: 'breathing_difficulty',
    label: 'Breathing Difficulty',
    emergencyLevel: 'critical',
    description: 'Difficulty breathing, chest pain, or respiratory issues'
  },
  {
    value: 'severe_injury',
    label: 'Severe Injury',
    emergencyLevel: 'critical',
    description: 'Serious injury, bleeding, or trauma'
  },
  {
    value: 'emergency',
    label: 'Medical Emergency',
    emergencyLevel: 'critical',
    description: 'Life-threatening condition requiring immediate attention'
  },
  {
    value: 'others',
    label: 'Others (Specify)',
    emergencyLevel: 'medium',
    description: 'Other medical concerns not listed above'
  }
];

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  years_of_experience?: number;
}

const getEmergencyLevelColor = (level: string) => {
  switch (level) {
    case 'low':
      return 'bg-teal-50 border-teal-500 text-teal-700';
    case 'medium':
      return 'bg-yellow-50 border-yellow-500 text-yellow-700';
    case 'high':
      return 'bg-orange-50 border-orange-500 text-orange-700';
    case 'critical':
      return 'bg-red-50 border-red-500 text-red-700';
    default:
      return 'bg-gray-50 border-gray-500 text-gray-700';
  }
};

const getEmergencyLevelIcon = (level: string) => {
  switch (level) {
    case 'low':
      return <Clock className="w-5 h-5" />;
    case 'medium':
      return <Activity className="w-5 h-5" />;
    case 'high':
      return <AlertTriangle className="w-5 h-5" />;
    case 'critical':
      return <AlertCircle className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
  }
};

export function CreateCaseForm() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const reasonDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedReason, setSelectedReason] = useState<CaseReason | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
  const [showReasonDropdown, setShowReasonDropdown] = useState(false);

  // Get pre-selected doctor from navigation state
  const navigationState = location.state as { selectedDoctorId?: string; selectedDoctorName?: string } | null;

  // Fetch doctors
  useEffect(() => {
    async function fetchDoctors() {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, full_name, specialization, years_of_experience')
          .eq('role', 'doctor');

        if (error) throw error;
        setDoctors(data || []);
        
        // Pre-select doctor if passed from navigation
        if (navigationState?.selectedDoctorId) {
          setSelectedDoctorId(navigationState.selectedDoctorId);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoadingDoctors(false);
      }
    }

    fetchDoctors();
  }, [navigationState]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDoctorDropdown(false);
      }
      if (reasonDropdownRef.current && !reasonDropdownRef.current.contains(event.target as Node)) {
        setShowReasonDropdown(false);
      }
    }

    if (showDoctorDropdown || showReasonDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDoctorDropdown, showReasonDropdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedReason || !description.trim()) return;

    // If "Others" is selected, validate custom reason
    if (selectedReason.value === 'others' && !customReason.trim()) {
      alert('Please specify your reason for consultation');
      return;
    }

    setSubmitting(true);
    try {
      const caseReason = selectedReason.value === 'others' ? customReason.trim() : selectedReason.value;
      
      const { error } = await supabase
        .from('medical_cases')
        .insert({
          patient_id: profile.id,
          doctor_id: selectedDoctorId || null, // Optional: assign to specific doctor if selected
          case_reason: caseReason,
          emergency_level: selectedReason.emergencyLevel,
          description: description.trim(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate('/patient-dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error creating case:', error);
      alert('Failed to create case. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <>
        <ParticlesBackground />
        <div className="min-h-screen relative z-10 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-lg shadow-lg border-l-4 border-teal-500 p-8 text-center">
              <CheckCircle className="w-16 h-16 text-teal-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Case Created Successfully!</h2>
              <p className="text-gray-600 mb-4">
                Your case has been submitted and doctors will be notified. You'll be redirected to your dashboard.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Redirecting...
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <ParticlesBackground />
      <div className="min-h-screen relative z-10 py-8">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg border-l-4 border-red-500 p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-semibold text-gray-900 mb-2">Create Medical Case</h2>
              <p className="text-gray-600">
                Select the reason for your consultation and provide details. A doctor will review and accept your case.
              </p>
            </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Case Reason Selection - Custom Dropdown */}
          <div ref={reasonDropdownRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reason for Consultation *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowReasonDropdown(!showReasonDropdown)}
                className={`w-full px-4 py-3 pr-10 border-2 rounded-lg focus:outline-none text-left transition-all ${
                  selectedReason 
                    ? `${getEmergencyLevelColor(selectedReason.emergencyLevel)} border-current`
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <span className={selectedReason ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                  {selectedReason ? selectedReason.label : 'Select a reason...'}
                </span>
                {selectedReason && (
                  <span className={`text-xs ml-2 px-2 py-1 rounded-full ${getEmergencyLevelColor(selectedReason.emergencyLevel)}`}>
                    {selectedReason.emergencyLevel.toUpperCase()}
                  </span>
                )}
              </button>
              <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none transition-transform ${showReasonDropdown ? 'rotate-180' : ''}`} />
              
              {/* Dropdown Menu - Opens Downward */}
              {showReasonDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                  {CASE_REASONS.map((reason) => (
                    <button
                      key={reason.value}
                      type="button"
                      onClick={() => {
                        setSelectedReason(reason);
                        setShowReasonDropdown(false);
                        if (reason.value !== 'others') {
                          setCustomReason('');
                        }
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-teal-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-900 font-medium flex items-center gap-2">
                          {getEmergencyLevelIcon(reason.emergencyLevel)}
                          {reason.label}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getEmergencyLevelColor(reason.emergencyLevel)}`}>
                          {reason.emergencyLevel.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 block">{reason.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedReason && (
              <p className="text-sm text-gray-600 mt-2">{selectedReason.description}</p>
            )}
          </div>

          {/* Custom Reason Input - Shows only when "Others" is selected */}
          {selectedReason?.value === 'others' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Specify Your Reason *
              </label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
                placeholder="e.g., Skin rash, Dental issue, Mental health consultation..."
                required
              />
            </div>
          )}

          {/* Emergency Level Info */}
          {selectedReason && (
            <div className={`p-4 rounded-lg border-l-4 ${getEmergencyLevelColor(selectedReason.emergencyLevel)}`}>
              <div className="flex items-start gap-3">
                {getEmergencyLevelIcon(selectedReason.emergencyLevel)}
                <div>
                  <h4 className="font-semibold mb-1">
                    {selectedReason.emergencyLevel === 'critical' && 'Critical - Immediate Attention Required'}
                    {selectedReason.emergencyLevel === 'high' && 'High Priority - Urgent Care Needed'}
                    {selectedReason.emergencyLevel === 'medium' && 'Medium Priority - Attention Needed Soon'}
                    {selectedReason.emergencyLevel === 'low' && 'Low Priority - Routine Consultation'}
                  </h4>
                  <p className="text-sm">
                    {selectedReason.emergencyLevel === 'critical' && 'Doctors will be notified immediately. If this is a life-threatening emergency, please call emergency services.'}
                    {selectedReason.emergencyLevel === 'high' && 'Doctors will prioritize your case and respond as soon as possible.'}
                    {selectedReason.emergencyLevel === 'medium' && 'Your case will be reviewed by available doctors within a few hours.'}
                    {selectedReason.emergencyLevel === 'low' && 'Your case will be reviewed by doctors during regular consultation hours.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Available Doctors Dropdown */}
          <div ref={dropdownRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Preferred Doctor (Optional)
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDoctorDropdown(!showDoctorDropdown)}
                className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none bg-white text-left hover:border-gray-300 transition-colors"
              >
                <span className={selectedDoctorId ? 'text-gray-900' : 'text-gray-500'}>
                  {selectedDoctorId
                    ? doctors.find(d => d.id === selectedDoctorId)?.full_name + 
                      ' - ' + 
                      (doctors.find(d => d.id === selectedDoctorId)?.specialization || 'General Practitioner')
                    : 'Any available doctor'}
                </span>
              </button>
              <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none transition-transform ${showDoctorDropdown ? 'rotate-180' : ''}`} />
              
              {/* Dropdown Menu - Opens Downward */}
              {showDoctorDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDoctorId('');
                      setShowDoctorDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-teal-50 transition-colors border-b border-gray-100"
                  >
                    <span className="text-gray-700 font-medium">Any available doctor</span>
                    <span className="text-sm text-gray-500 block mt-1">Let doctors accept based on availability</span>
                  </button>
                  
                  {loadingDoctors ? (
                    <div className="px-4 py-3 text-gray-500 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading doctors...
                    </div>
                  ) : doctors.length === 0 ? (
                    <div className="px-4 py-3 text-gray-500">No doctors available</div>
                  ) : (
                    doctors.map((doctor) => (
                      <button
                        key={doctor.id}
                        type="button"
                        onClick={() => {
                          setSelectedDoctorId(doctor.id);
                          setShowDoctorDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-teal-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <span className="text-gray-900 font-medium">{doctor.full_name}</span>
                        <span className="text-sm text-gray-600 block mt-1">
                          {doctor.specialization || 'General Practitioner'}
                          {doctor.years_of_experience && ` • ${doctor.years_of_experience} years exp.`}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {selectedDoctorId 
                ? 'Your case will be assigned to the selected doctor.' 
                : 'Leave empty to let any available doctor accept your case based on priority.'}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Describe Your Symptoms or Concerns *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:outline-none"
              placeholder="Please provide detailed information about your symptoms, when they started, and any relevant medical history..."
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              Minimum 20 characters. Be as detailed as possible to help doctors understand your situation.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/patient-dashboard')}
              className="px-6 py-3 text-gray-700 hover:text-gray-900 font-semibold"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !selectedReason || 
                (selectedReason.value === 'others' && !customReason.trim()) || 
                description.length < 20 || 
                submitting
              }
              className="px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold border-2 border-teal-600"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Case...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Create Case
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
      </div>
      <Footer />
    </>
  );
}
