import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { X, Send, Loader2 } from 'lucide-react';

interface ContactDoctorFormProps {
  onClose: () => void;
}

export function ContactDoctorForm({ onClose }: ContactDoctorFormProps) {
  const { profile } = useAuth();
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || message.trim() === '') return;

    setIsSending(true);
    setError(null);

    try {
      // Here you would typically send the message to a specific doctor.
      // For this example, we'll save it to a generic 'messages' table
      // and assume a backend process notifies the doctor.
      const { error } = await supabase.from('messages').insert({
        patient_id: profile.id,
        doctor_id: selectedDoctor,
        content: message,
        // You might add a doctor_id field here if you have a system for assigning doctors
      });

      if (error) throw error;

      setIsSent(true);
      setMessage('');
      setTimeout(() => {
        onClose();
      }, 3000); // Close form after 3 seconds
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Contact a Doctor</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {isSent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
            <p className="text-gray-600">
              A doctor will review your message and get back to you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-2">
                Select a Doctor
              </label>
              <select
                id="doctor"
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              >
                <option value="" disabled>
                  Please select a doctor
                </option>
                <option value="dr-adams">Dr. Adams - Cardiologist</option>
                <option value="dr-baker">Dr. Baker - Dermatologist</option>
                <option value="dr-clark">Dr. Clark - General Practitioner</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Your Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Describe your symptoms or ask a question..."
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
              type="submit"
              disabled={isSending || message.trim() === ''}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:bg-blue-300"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Message
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
