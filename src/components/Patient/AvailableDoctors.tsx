import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { User, Stethoscope, Phone, MessageCircle, FileText, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  years_of_experience?: number;
  education?: string;
  bio?: string;
  consultation_fee?: number;
  phone?: string;
  hasAcceptedCase?: boolean;
}

export function AvailableDoctors({ onStartConversation }: { onStartConversation?: (doctorId: string) => void }) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingConversation, setStartingConversation] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, full_name, specialization, years_of_experience, education, bio, consultation_fee, phone')
          .eq('role', 'doctor');

        if (error) {
          console.error('Supabase error:', error);
          setError(error.message);
          throw error;
        }

        console.log('Fetched doctors:', data);
        
        // Check if patient has accepted cases with each doctor
        if (profile && data) {
          const doctorsWithCaseStatus = await Promise.all(
            data.map(async (doctor) => {
              const { data: acceptedCases, error: caseError } = await supabase
                .from('medical_cases')
                .select('id, status')
                .eq('patient_id', profile.id)
                .eq('doctor_id', doctor.id)
                .in('status', ['accepted', 'in_progress'])
                .limit(1);
              
              if (caseError) {
                console.error('Error checking case for doctor:', doctor.full_name, caseError.message, caseError);
              } else {
                console.log(`Doctor ${doctor.full_name} - Has accepted case:`, !!(acceptedCases && acceptedCases.length > 0), 'Case count:', acceptedCases?.length);
              }
              
              return {
                ...doctor,
                hasAcceptedCase: !!(acceptedCases && acceptedCases.length > 0)
              };
            })
          );
          setDoctors(doctorsWithCaseStatus);
        } else {
          setDoctors(data || []);
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setError('Failed to load doctors. Please check database permissions.');
      } finally {
        setLoading(false);
      }
    }

    fetchDoctors();
  }, [profile]);

  const handleStartConversation = async (doctorId: string) => {
    if (!profile) return;
    
    setStartingConversation(doctorId);
    try {
      // Check if conversation already exists
      const { data: existingConv, error: searchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('patient_id', profile.id)
        .eq('doctor_id', doctorId)
        .maybeSingle();

      if (searchError && searchError.code !== 'PGRST116') throw searchError;

      if (existingConv) {
        // Conversation exists, navigate to it
        if (onStartConversation) {
          onStartConversation(doctorId);
        }
      } else {
        // Create new conversation
        const { data: newConv, error: insertError } = await supabase
          .from('conversations')
          .insert({
            patient_id: profile.id,
            doctor_id: doctorId,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        if (onStartConversation && newConv) {
          onStartConversation(doctorId);
        }
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation. Please try again.');
    } finally {
      setStartingConversation(null);
    }
  };

  const handleCall = (phoneNumber?: string) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      alert('Phone number not available for this doctor.');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <p className="text-gray-500">Loading doctors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">Error loading doctors</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <p className="text-gray-600 text-sm mt-2">
            Please ensure the database policies allow viewing doctor profiles.
          </p>
        </div>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Doctors</h2>
        <p className="text-gray-500">No doctors available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Doctors</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="bg-gray-50 p-5 rounded-lg border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-7 h-7 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{doctor.full_name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <Stethoscope className="w-4 h-4" />
                    <span>{doctor.specialization || 'General Practitioner'}</span>
                  </div>
                  {doctor.years_of_experience && (
                    <p className="text-xs text-gray-500 mt-1">
                      {doctor.years_of_experience} years of experience
                    </p>
                  )}
                </div>
              </div>
              
              {doctor.education && (
                <div className="mb-3 text-sm">
                  <p className="text-gray-600 font-medium">Education:</p>
                  <p className="text-gray-700">{doctor.education}</p>
                </div>
              )}
              
              {doctor.bio && (
                <div className="mb-3 text-sm">
                  <p className="text-gray-700 line-clamp-3">{doctor.bio}</p>
                </div>
              )}
              
              {doctor.consultation_fee && (
                <div className="mb-3">
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                    ${doctor.consultation_fee} per session
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex gap-2">
              {doctor.hasAcceptedCase ? (
                <>
                  {/* Show messaging and call buttons only if case is accepted */}
                  <button
                    onClick={() => handleStartConversation(doctor.id)}
                    disabled={startingConversation === doctor.id}
                    className="flex-1 bg-teal-500 text-white py-2.5 rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {startingConversation === doctor.id ? 'Starting...' : 'Message'}
                  </button>
                  {doctor.phone && (
                    <button
                      onClick={() => handleCall(doctor.phone)}
                      className="flex-1 bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <Phone className="w-4 h-4" />
                      Call
                    </button>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Active Case
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {/* Show only request case button if no accepted case */}
                  <button
                    onClick={() => navigate('/create-case', { state: { selectedDoctorId: doctor.id, selectedDoctorName: doctor.full_name } })}
                    className="flex-1 bg-indigo-500 text-white py-2.5 rounded-lg hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <FileText className="w-4 h-4" />
                    Request Case
                  </button>
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                      No Active Case
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
