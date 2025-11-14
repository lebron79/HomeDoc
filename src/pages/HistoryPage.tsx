import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ConversationHistory } from '../components/Patient/ConversationHistory';
import { ParticlesBackground } from '../components/Layout/ParticlesBackground';
import { Footer } from '../components/Layout/Footer';

export default function HistoryPage() {
  useAuth(); // Ensure user is authenticated
  const [loading] = useState(false);
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('id');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 relative">
      <ParticlesBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="bg-white/95 backdrop-blur-sm max-w-4xl mx-auto p-8 rounded-2xl shadow-lg border border-gray-200">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Conversation History</h1>
            <p className="text-md text-gray-500">Review your past conversations and health reports.</p>
          </div>

          <ConversationHistory defaultExpandedId={conversationId || undefined} />
        </div>
      </div>

      <Footer />
    </div>
  );
}
