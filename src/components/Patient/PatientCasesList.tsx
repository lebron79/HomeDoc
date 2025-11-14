import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  Activity,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Loader2,
  Eye,
  Plus
} from 'lucide-react';
import { ParticlesBackground } from '../Layout/ParticlesBackground';
import { Footer } from '../Layout/Footer';
import { DoctorMessaging } from './DoctorMessaging';

interface MedicalCase {
  id: string;
  case_reason: string;
  emergency_level: string;
  description: string;
  status: string;
  created_at: string;
  accepted_at: string | null;
  doctor_id: string | null;
  doctor?: {
    full_name: string;
    specialization: string;
  };
}

const getEmergencyLevelColor = (level: string) => {
  switch (level) {
    case 'low':
      return 'text-teal-700 bg-teal-50 border-teal-300';
    case 'medium':
      return 'text-yellow-700 bg-yellow-50 border-yellow-300';
    case 'high':
      return 'text-orange-700 bg-orange-50 border-orange-300';
    case 'critical':
      return 'text-red-700 bg-red-50 border-red-300';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-300';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'text-blue-700 bg-blue-50 border-blue-300';
    case 'accepted':
      return 'text-green-700 bg-green-50 border-green-300';
    case 'in_progress':
      return 'text-purple-700 bg-purple-50 border-purple-300';
    case 'completed':
      return 'text-gray-700 bg-gray-50 border-gray-300';
    case 'cancelled':
      return 'text-red-700 bg-red-50 border-red-300';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-300';
  }
};

const getEmergencyIcon = (level: string) => {
  switch (level) {
    case 'low':
      return <Clock className="w-4 h-4" />;
    case 'medium':
      return <Activity className="w-4 h-4" />;
    case 'high':
      return <AlertTriangle className="w-4 h-4" />;
    case 'critical':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="w-4 h-4" />;
    case 'accepted':
      return <CheckCircle className="w-4 h-4" />;
    case 'in_progress':
      return <Activity className="w-4 h-4" />;
    case 'completed':
      return <CheckCircle className="w-4 h-4" />;
    case 'cancelled':
      return <XCircle className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const formatCaseReason = (reason: string) => {
  return reason.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export function PatientCasesList() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState<MedicalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [showMessaging, setShowMessaging] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      loadCases();
      
      // Subscribe to case updates
      const channel = supabase
        .channel('patient-cases')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'medical_cases',
            filter: `patient_id=eq.${profile.id}`,
          },
          () => {
            loadCases();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile]);

  const loadCases = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('medical_cases')
        .select(`
          *,
          doctor:user_profiles!medical_cases_doctor_id_fkey(full_name, specialization)
        `)
        .eq('patient_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = (caseItem: MedicalCase) => {
    if (caseItem.doctor_id && (caseItem.status === 'accepted' || caseItem.status === 'in_progress')) {
      setSelectedDoctorId(caseItem.doctor_id);
      setShowMessaging(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  // Show Messaging view
  if (showMessaging && selectedDoctorId) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 relative overflow-hidden">
          <ParticlesBackground />
          <div className="max-w-6xl mx-auto p-6 relative z-10">
            <DoctorMessaging onBack={() => {
              setShowMessaging(false);
              setSelectedDoctorId(null);
            }} />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 relative overflow-hidden pb-16">
        <ParticlesBackground />
        <div className="max-w-6xl mx-auto p-6 relative z-10">
          <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">My Medical Cases</h2>
          <p className="text-gray-600 mt-1">View and manage your consultation requests</p>
        </div>
        <button
          onClick={() => navigate('/create-case')}
          className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-semibold border-2 border-teal-600"
        >
          <Plus className="w-5 h-5" />
          New Case
        </button>
      </div>

      {cases.length === 0 ? (
        <div className="bg-white rounded-lg shadow border-l-4 border-gray-300 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cases Yet</h3>
          <p className="text-gray-600 mb-6">Create your first medical case to connect with a doctor</p>
          <button
            onClick={() => navigate('/create-case')}
            className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-3 rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2 font-semibold border-2 border-teal-600"
          >
            <Plus className="w-5 h-5" />
            Create Case
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {cases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="bg-white rounded-lg shadow border-l-4 border-teal-500 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {formatCaseReason(caseItem.case_reason)}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getEmergencyLevelColor(caseItem.emergency_level)}`}>
                        {getEmergencyIcon(caseItem.emergency_level)}
                        {caseItem.emergency_level.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(caseItem.status)}`}>
                        {getStatusIcon(caseItem.status)}
                        {caseItem.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Created {new Date(caseItem.created_at).toLocaleString()}
                    </p>
                    {caseItem.doctor && (
                      <p className="text-sm text-teal-600 mt-1">
                        Assigned to Dr. {caseItem.doctor.full_name}
                        {caseItem.doctor.specialization && ` - ${caseItem.doctor.specialization}`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {(caseItem.status === 'accepted' || caseItem.status === 'in_progress') && caseItem.doctor_id && (
                      <button
                        onClick={() => handleOpenChat(caseItem)}
                        className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-semibold border border-teal-600"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Chat
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedCase(expandedCase === caseItem.id ? null : caseItem.id)}
                      className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {expandedCase === caseItem.id && (
                  <div className="mt-4 pt-4 border-t-2 border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Description:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{caseItem.description}</p>
                    {caseItem.accepted_at && (
                      <p className="text-sm text-gray-500 mt-3">
                        Accepted on {new Date(caseItem.accepted_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
