import { useState, useEffect } from 'react';
import { ContactDoctorForm } from './ContactDoctorForm';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ParticlesBackground } from '../Layout/ParticlesBackground';

interface Diagnosis {
  id: string;
  patient_id: string;
  disease_name: string;
  severity_level: string;
  diagnosis_type: 'ai' | 'manual';
  requires_doctor: boolean;
  is_validated: boolean;
  created_at: string;
  recommendation: string;
}
import { SymptomChecker } from './SymptomChecker';
import { DiagnosisResult } from './DiagnosisResult';
import { HealthAssessmentForm, HealthAssessment } from './HealthAssessmentForm';
import { HealthPrediction } from './HealthPrediction';
import { ConversationHistory } from './ConversationHistory';
import { AvailableDoctors } from './AvailableDoctors';
import { DoctorMessaging } from './DoctorMessaging';
import {
  History,
  Loader2,
  Plus,
  Stethoscope,
  Brain,
  Activity,
  ArrowLeft,
  MessageCircle,
  Phone,
  BookOpen,
  FileText,
  Sparkles,
  Zap,
  Users,
  ClipboardList,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../Layout/Footer';

export function PatientDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isCheckingSymptoms, setIsCheckingSymptoms] = useState(false);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<Diagnosis | null>(null);
  const [diagnosisHistory, setDiagnosisHistory] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHealthAssessment, setShowHealthAssessment] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<HealthAssessment | null>(null);
  const [showPrediction, setShowPrediction] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showAvailableDoctors, setShowAvailableDoctors] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [conversationRefreshTrigger, setConversationRefreshTrigger] = useState(0);
  const [recentCases, setRecentCases] = useState<any[]>([]);

  useEffect(() => {
    const loadAllData = async () => {
      if (!profile) return;
      
      try {
        await Promise.all([
          loadDiagnosisHistory(),
          loadRecentCases(),
          loadUnreadMessageCount()
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
    
    // Set up real-time subscription for unread messages
    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${profile?.id}`,
        },
        () => {
          loadUnreadMessageCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const loadUnreadMessageCount = async () => {
    if (!profile) return;

    try {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', profile.id)
        .eq('is_read', false);

      setUnreadMessageCount(count || 0);
    } catch (error) {
      console.error('Error loading unread message count:', error);
    }
  };

  const loadDiagnosisHistory = async () => {
    if (!profile) return;

    try {
      // Load conversations from ai_conversations table
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert conversations to diagnosis format for compatibility
      const diagnosesFromConversations = (data || []).map(conv => ({
        id: conv.id,
        patient_id: conv.user_id,
        diagnosis_type: 'ai' as const,
        disease_name: conv.final_diagnosis?.diagnosis || 'AI Analysis',
        recommendation: conv.final_diagnosis?.recommendation || '',
        severity_level: conv.severity || 'low',
        requires_doctor: conv.final_diagnosis?.requiresDoctor || false,
        is_validated: false,
        created_at: conv.created_at
      }));

      setDiagnosisHistory(diagnosesFromConversations);
    } catch (error) {
      console.error('Error loading diagnosis history:', error);
    }
  };

  const loadRecentCases = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('medical_cases')
        .select(`
          id,
          case_reason,
          description,
          emergency_level,
          status,
          created_at,
          doctor_id,
          user_profiles:doctor_id (
            full_name
          )
        `)
        .eq('patient_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(2);

      if (error) throw error;
      setRecentCases(data || []);
    } catch (error) {
      console.error('Error loading recent cases:', error);
    }
  };

  const simulateAIDiagnosis = (symptoms: string, severity: string): Diagnosis => {
    const conditions = [
      {
        disease: 'Common Cold',
        recommendation:
          'Rest and stay hydrated. Take over-the-counter medications for symptom relief. Should improve within 7-10 days.',
        severityLevel: 'low' as const,
        requiresDoctor: false,
      },
      {
        disease: 'Seasonal Flu',
        recommendation:
          'Get plenty of rest, drink fluids, and consider antiviral medications. Monitor symptoms and seek medical care if they worsen.',
        severityLevel: 'medium' as const,
        requiresDoctor: false,
      },
      {
        disease: 'Possible Infection',
        recommendation:
          'Your symptoms suggest a possible infection. Please consult with a doctor for proper examination and potential antibiotic treatment.',
        severityLevel: 'high' as const,
        requiresDoctor: true,
      },
      {
        disease: 'Tension Headache',
        recommendation:
          'Rest in a quiet, dark room. Apply cold or warm compress. Stay hydrated and manage stress levels.',
        severityLevel: 'low' as const,
        requiresDoctor: false,
      },
      {
        disease: 'Migraine',
        recommendation:
          'Rest in a quiet, dark room. Consider over-the-counter pain relievers. If migraines are frequent, consult a doctor for preventive treatment.',
        severityLevel: 'medium' as const,
        requiresDoctor: severity === 'severe',
      },
    ];

    const condition =
      severity === 'severe' ? conditions[2] : conditions[Math.floor(Math.random() * conditions.length)];

    return {
      id: Date.now().toString(),
      patient_id: profile?.id || '',
      diagnosis_type: 'ai',
      disease_name: condition.disease,
      recommendation: condition.recommendation,
      severity_level: condition.severityLevel,
      requires_doctor: condition.requiresDoctor,
      is_validated: false,
      created_at: new Date().toISOString(),
    };
  };

  const handleSubmitSymptoms = async (
    symptoms: string,
    severity: 'mild' | 'moderate' | 'severe'
  ) => {
    if (!profile) return;

    try {
      // The conversation is already saved in the SymptomChecker component
      // Here we just need to update the UI state
      const aiDiagnosis = simulateAIDiagnosis(symptoms, severity);
      
      // Create a simplified diagnosis object for the UI
      const diagnosisData = {
        id: Date.now().toString(),
        patient_id: profile.id,
        diagnosis_type: 'ai' as const,
        disease_name: aiDiagnosis.disease_name,
        recommendation: aiDiagnosis.recommendation,
        severity_level: aiDiagnosis.severity_level,
        requires_doctor: aiDiagnosis.requires_doctor,
        is_validated: false,
        created_at: new Date().toISOString(),
      };

      setCurrentDiagnosis(diagnosisData);
      setIsCheckingSymptoms(false);
      loadDiagnosisHistory();
    } catch (error) {
      console.error('Error submitting symptoms:', error);
    }
  };

  const handleFeedback = async (rating: number, comment: string) => {
    if (!profile || !currentDiagnosis) return;

    try {
      await supabase.from('feedback').insert({
        diagnosis_id: currentDiagnosis.id,
        patient_id: profile.id,
        rating,
        comment,
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleNewCheck = () => {
    setCurrentDiagnosis(null);
    setIsCheckingSymptoms(true);
  };

  const handleHealthAssessment = (assessment: HealthAssessment) => {
    setCurrentAssessment(assessment);
    setShowHealthAssessment(false);
    setShowPrediction(true);
  };

  const handleBackToAssessment = () => {
    setShowPrediction(false);
    setShowHealthAssessment(true);
  };

  const handleNewAssessment = () => {
    setCurrentAssessment(null);
    setShowPrediction(false);
    setShowHealthAssessment(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (showHealthAssessment) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
          <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
              <button
                onClick={() => setShowHealthAssessment(false)}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors mb-4"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Comprehensive Health Assessment
              </h1>
              <p className="text-gray-600">
                Complete this detailed assessment to get personalized health recommendations
              </p>
            </div>
            <HealthAssessmentForm
              onSubmit={handleHealthAssessment}
              onCancel={() => setShowHealthAssessment(false)}
            />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (showPrediction && currentAssessment) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
          <div className="max-w-6xl mx-auto p-6">
            <HealthPrediction
              assessment={currentAssessment}
              onBack={handleBackToAssessment}
              onNewAssessment={handleNewAssessment}
            />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Show Messaging view
  if (showMessaging) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
          <div className="max-w-6xl mx-auto p-6">
            <DoctorMessaging onBack={() => setShowMessaging(false)} />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Show Available Doctors view
  if (showAvailableDoctors) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
          <div className="max-w-6xl mx-auto p-6">
            <div className="mb-6">
              <button
                onClick={() => setShowAvailableDoctors(false)}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors mb-4"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Available Doctors
              </h1>
              <p className="text-gray-600">
                Browse and contact our qualified healthcare professionals
              </p>
            </div>
            <AvailableDoctors 
              onStartConversation={() => {
                setShowAvailableDoctors(false);
                setShowMessaging(true);
              }} 
            />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 pb-16 relative overflow-hidden">
        <ParticlesBackground />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Header */}
          <div className="mb-8 pt-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {profile?.full_name}! 👋
            </h1>
            <p className="text-lg text-gray-600">
              Your personal health companion powered by AI
            </p>
          </div>

          {/* Main Layout: Left Content + Right Sidebar */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content - Left Column (2/3) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* AI Health Assistant Section */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">AI Health Assistant</h2>
                    <p className="text-sm text-gray-600">Get instant health insights powered by AI</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Quick Symptom Check */}
                  <button
                    onClick={() => {
                      setIsCheckingSymptoms(true);
                      setTimeout(() => {
                        document.getElementById('symptom-chat-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }}
                    className="group relative overflow-hidden bg-gradient-to-br from-red-500 to-pink-500 p-6 rounded-xl text-left transition-all hover:shadow-2xl hover:scale-105 active:scale-95"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Quick Symptom Check ⚡
                      </h3>
                      <p className="text-white/90 text-sm mb-4">
                        Chat with our AI assistant about your symptoms and get instant recommendations
                      </p>
                      <div className="flex items-center gap-2 text-white/80 text-xs">
                        <MessageCircle className="w-4 h-4" />
                        <span>Chat-based • Instant results • Free</span>
                      </div>
                    </div>
                  </button>

                  {/* Comprehensive Health Assessment */}
                  <button
                    onClick={() => navigate('/disease-prediction')}
                    className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-500 p-6 rounded-xl text-left transition-all hover:shadow-2xl hover:scale-105 active:scale-95"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <ClipboardList className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        Health Prediction Model 🎯
                      </h3>
                      <p className="text-white/90 text-sm mb-4">
                        Fill out a detailed form for AI-powered disease prediction based on trained models
                      </p>
                      <div className="flex items-center gap-2 text-white/80 text-xs">
                        <Sparkles className="w-4 h-4" />
                        <span>Form-based • ML Prediction • Detailed</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Quick Access Hub */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="w-6 h-6 text-teal-600" />
                  <h2 className="text-xl font-bold text-gray-900">Quick Access Hub</h2>
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Doctors */}
                  <button
                    onClick={() => setShowAvailableDoctors(true)}
                    className="group p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">Find Doctors</p>
                    <p className="text-xs text-gray-500 mt-1">Browse specialists</p>
                  </button>

                  {/* Messages */}
                  <button
                    onClick={() => setShowMessaging(true)}
                    className="group relative p-4 rounded-xl border-2 border-gray-200 hover:border-green-400 hover:bg-green-50 transition-all text-center"
                  >
                    {/* Always show unread count badge */}
                    <span className={`absolute top-2 right-2 w-6 h-6 text-white text-xs rounded-full flex items-center justify-center font-bold ${
                      unreadMessageCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
                    }`}>
                      {unreadMessageCount}
                    </span>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">Messages</p>
                    <p className="text-xs text-gray-500 mt-1">Chat with doctors</p>
                  </button>

                  {/* My Cases */}
                  <button
                    onClick={() => navigate('/my-cases')}
                    className="group p-4 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-center"
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">My Cases</p>
                    <p className="text-xs text-gray-500 mt-1">View active cases</p>
                  </button>

                  {/* Start Case */}
                  <button
                    onClick={() => navigate('/create-case')}
                    className="group p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all text-center"
                  >
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <ClipboardList className="w-6 h-6 text-indigo-600" />
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">Start Case</p>
                    <p className="text-xs text-gray-500 mt-1">Consult a doctor</p>
                  </button>
                </div>
              </div>

              {/* Additional Resources */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-bold text-gray-900">Health Resources</h2>
                </div>
                <div className="grid sm:grid-cols-1 gap-3">
                  <button
                    onClick={() => navigate('/common-diseases')}
                    className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 text-left group"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Common Diseases</p>
                      <p className="text-xs text-gray-500">Learn about conditions</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Recent Conversations and Cases */}
            <div className="space-y-6">
              {/* Recent Conversations */}
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => navigate('/history')}
                    className="flex items-center gap-3 group hover:opacity-80 transition-opacity"
                  >
                    <History className="w-6 h-6 text-red-600 group-hover:scale-110 transition-transform" />
                    <h2 className="text-xl font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                      Recent Conversations
                    </h2>
                  </button>
                  <button
                    onClick={() => navigate('/history')}
                    className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline"
                  >
                    View All →
                  </button>
                </div>
                <ConversationHistory refreshTrigger={conversationRefreshTrigger} limit={3} compact={true} />
              </div>

              {/* Recent Cases */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => navigate('/my-cases')}
                    className="flex items-center gap-3 group hover:opacity-80 transition-opacity"
                  >
                    <ClipboardList className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                    <h2 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      Recent Cases
                    </h2>
                  </button>
                  <button
                    onClick={() => navigate('/my-cases')}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                  >
                    View All →
                  </button>
                </div>
                
                {recentCases.length > 0 ? (
                  <div className="space-y-3">
                    {recentCases.map((caseItem) => (
                      <button
                        key={caseItem.id}
                        onClick={() => navigate('/my-cases')}
                        className="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                                caseItem.emergency_level === 'critical' ? 'bg-red-100 text-red-700' :
                                caseItem.emergency_level === 'high' ? 'bg-orange-100 text-orange-700' :
                                caseItem.emergency_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {caseItem.emergency_level}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                caseItem.status === 'pending' ? 'bg-gray-100 text-gray-700' :
                                caseItem.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                caseItem.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {caseItem.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="font-semibold text-gray-900 text-sm mb-1 truncate group-hover:text-indigo-700 transition-colors">
                              {caseItem.case_reason.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </p>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {caseItem.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(caseItem.created_at).toLocaleDateString()}</span>
                              </div>
                              {caseItem.user_profiles && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span className="truncate">Dr. {caseItem.user_profiles.full_name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <AlertCircle className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors flex-shrink-0 mt-1" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-3">No cases yet</p>
                    <button
                      onClick={() => navigate('/create-case')}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                    >
                      Start Your First Case →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showContactForm && <ContactDoctorForm onClose={() => setShowContactForm(false)} />}

        {/* Symptom Checker Section - Inside the grid layout with top margin */}
        {isCheckingSymptoms && !currentDiagnosis && (
          <div id="symptom-chat-section" className="max-w-7xl mx-auto px-6 pb-6 pt-6 relative z-10">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Chat takes the left 2/3 column like other sections */}
              <div className="lg:col-span-2">
                <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Medical-themed decorative border */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Corner decorations - Medical symbols */}
                    <div className="absolute top-0 left-0 w-20 h-20 opacity-5">
                      <svg viewBox="0 0 100 100" fill="currentColor" className="text-teal-600">
                        <path d="M50 20 L50 45 L25 45 L25 55 L50 55 L50 80 L60 80 L60 55 L85 55 L85 45 L60 45 L60 20 Z"/>
                      </svg>
                    </div>
                    <div className="absolute top-0 right-0 w-16 h-16 opacity-5">
                      <svg viewBox="0 0 100 100" fill="currentColor" className="text-teal-600">
                        <circle cx="50" cy="50" r="30"/>
                        <path d="M50 30 L50 70 M30 50 L70 50" stroke="white" strokeWidth="6"/>
                      </svg>
                    </div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 opacity-5">
                      <svg viewBox="0 0 100 100" fill="currentColor" className="text-teal-600">
                        <path d="M50 20 C30 20 20 30 20 50 C20 70 30 80 50 80 C70 80 80 70 80 50 C80 30 70 20 50 20 Z M50 40 L60 50 L50 60 L40 50 Z"/>
                      </svg>
                    </div>
                    <div className="absolute bottom-0 right-0 w-20 h-20 opacity-5">
                      <svg viewBox="0 0 100 100" fill="currentColor" className="text-teal-600">
                        <path d="M50 10 L45 40 L15 40 L40 60 L30 90 L50 70 L70 90 L60 60 L85 40 L55 40 Z"/>
                      </svg>
                    </div>
                    
                    {/* Side borders with pulse pattern */}
                    <div className="absolute left-0 top-10 bottom-10 w-0.5 bg-gradient-to-b from-transparent via-teal-200 to-transparent opacity-40"></div>
                    <div className="absolute right-0 top-10 bottom-10 w-0.5 bg-gradient-to-b from-transparent via-teal-200 to-transparent opacity-40"></div>
                    
                    {/* Top and bottom accent lines */}
                    <div className="absolute top-0 left-10 right-10 h-0.5 bg-gradient-to-r from-transparent via-teal-300 to-transparent opacity-50"></div>
                    <div className="absolute bottom-0 left-10 right-10 h-0.5 bg-gradient-to-r from-transparent via-teal-300 to-transparent opacity-50"></div>
                  </div>

                  {/* Comfortable teal/blue header */}
                  <div className="relative bg-gradient-to-r from-teal-600 to-cyan-600 p-4 border-b-2 border-teal-700/20">
                    {/* Subtle pattern background */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 20 Q10 10, 20 20 T40 20 V40 H0Z' /%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '40px 40px'
                      }}></div>
                    </div>
                    
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Icon with medical cross and pulse animation */}
                        <div className="relative">
                          <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                            <MessageCircle className="w-6 h-6 text-white" />
                          </div>
                          <div className="absolute -top-1 -right-1">
                            <span className="flex h-3.5 w-3.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border-2 border-white"></span>
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-white">AI Symptom Checker</h3>
                            <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/40 text-white font-semibold tracking-wide">
                              INSTANT
                            </span>
                          </div>
                          <p className="text-white/95 text-xs mt-0.5 flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                            Chat with AI • Get instant health insights
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setIsCheckingSymptoms(false);
                          setConversationRefreshTrigger(prev => prev + 1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center transition-all hover:scale-110 border border-white/30 group"
                        title="Close"
                      >
                        <svg className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Chat Container with subtle gradient background */}
                  <div className="p-4 bg-gradient-to-b from-teal-50/30 to-white">
                    <SymptomChecker 
                      onClose={() => {
                        setIsCheckingSymptoms(false);
                        setConversationRefreshTrigger(prev => prev + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Empty space for the right sidebar to maintain layout */}
              <div className="hidden lg:block"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer - Full Width Outside All Containers */}
      <Footer />
    </>
  );
}
