import { useState, useEffect, useRef } from 'react';
import { Brain, MessageCircle, CalendarDays, ArrowDown, Trash2, Star } from 'lucide-react';
import { supabase, AIConversation } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ConversationHistoryProps {
  refreshTrigger?: number;
  limit?: number;
  compact?: boolean;
  defaultExpandedId?: string;
}

export function ConversationHistory({ refreshTrigger, limit, compact = false, defaultExpandedId }: ConversationHistoryProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedConversation, setExpandedConversation] = useState<string | null>(defaultExpandedId || null);
  const expandedRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [ratingConversation, setRatingConversation] = useState<string | null>(null);
  const [tempRating, setTempRating] = useState<number>(0);
  const [tempComment, setTempComment] = useState<string>('');

  useEffect(() => {
    async function fetchConversations() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('ai_conversations')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        console.log('Fetched conversations:', data);
        console.log('First conversation full object:', data?.[0]);
        console.log('First conversation rating:', data?.[0]?.rating);
        console.log('First conversation rating_comment:', data?.[0]?.rating_comment);
        setConversations(data || []);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchConversations();
  }, [user, refreshTrigger]);

  // Scroll to expanded conversation when defaultExpandedId is set
  useEffect(() => {
    if (defaultExpandedId && expandedRef.current[defaultExpandedId]) {
      setTimeout(() => {
        expandedRef.current[defaultExpandedId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  }, [defaultExpandedId, conversations]);

  const handleDeleteConversation = async (conversationId: string) => {
    setDeletingId(conversationId);
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      // Remove from local state
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmitRating = async (conversationId: string) => {
    if (tempRating === 0) {
      alert('Please select a rating');
      return;
    }

    console.log('Submitting rating for conversation:', conversationId, 'Rating:', tempRating);

    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .update({
          rating: tempRating,
          rating_comment: tempComment || null
        })
        .eq('id', conversationId)
        .select();

      console.log('Rating update response:', { data, error });

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('No rows were updated. Check RLS policies.');
      }

      console.log('Rating saved successfully:', data[0]);

      // Update local state
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, rating: tempRating, rating_comment: tempComment || undefined }
            : conv
        )
      );

      // Reset form
      setRatingConversation(null);
      setTempRating(0);
      setTempComment('');
      
      alert('Rating saved successfully! ⭐');
    } catch (error: any) {
      console.error('Error saving rating:', error);
      alert(`Failed to save rating: ${error.message || 'Please check if you have permission to update this conversation.'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No conversations yet</h3>
        <p className="text-gray-500 text-sm mt-1">
          Start a symptom check or health chat to see your history here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Conversation History</h2>
          <p className="text-sm text-gray-600">{conversations.length} saved conversation{conversations.length !== 1 ? 's' : ''}</p>
        </div>
      )}
      
      {(limit ? conversations.slice(0, limit) : conversations).map((conversation) => {
        const conversationDate = new Date(conversation.created_at);
        const diagnosisText = conversation.final_diagnosis?.diagnosis || 'Health consultation';
        const displayTitle = conversation.title || diagnosisText;
        
        return (
          <div 
            key={conversation.id} 
            ref={(el) => { expandedRef.current[conversation.id] = el; }}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    conversation.conversation_type === 'symptom_check'
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-teal-50 border border-teal-200'
                  }`}>
                    {conversation.conversation_type === 'symptom_check' ? (
                      <Brain className="w-5 h-5 text-red-600" />
                    ) : (
                      <MessageCircle className="w-5 h-5 text-teal-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 
                      className={`font-semibold text-gray-900 text-base mb-1 line-clamp-2 ${
                        compact ? 'cursor-pointer hover:text-red-600 transition-colors' : ''
                      }`}
                      onClick={() => {
                        if (compact) {
                          navigate(`/history?id=${conversation.id}`);
                        }
                      }}
                    >
                      {displayTitle}
                    </h3>
                    <div className="flex items-center gap-3">
                      {!compact && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <CalendarDays className="w-4 h-4" />
                          <span>
                            {conversationDate.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })} at {conversationDate.toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      )}
                      {/* Show rating stars in both compact and full view */}
                      {conversation.rating && (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < conversation.rating!
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {conversation.final_diagnosis && (
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        conversation.final_diagnosis.severity === 'high'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : conversation.final_diagnosis.severity === 'medium'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : 'bg-green-100 text-green-800 border border-green-200'
                      }`}
                    >
                      {conversation.final_diagnosis.severity.toUpperCase()}
                    </div>
                  )}
                  
                  <button
                    onClick={() => setShowDeleteConfirm(conversation.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rating Display or Rating Form */}
              {!compact && conversation.rating && ratingConversation !== conversation.id && (
                <div className="mb-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-700">Your Rating:</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < conversation.rating!
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-gray-900">
                        {conversation.rating}/5
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setRatingConversation(conversation.id);
                        setTempRating(conversation.rating!);
                        setTempComment(conversation.rating_comment || '');
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  {conversation.rating_comment && (
                    <p className="text-xs text-gray-600 mt-2 italic pl-2 border-l-2 border-yellow-300">
                      "{conversation.rating_comment}"
                    </p>
                  )}
                </div>
              )}

              {/* Rating Form - Show if no rating or editing */}
              {!compact && (!conversation.rating || ratingConversation === conversation.id) && (
                <div className="mb-3 p-3 bg-yellow-50 rounded-lg border-2 border-yellow-300">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    {conversation.rating ? 'Update your rating' : 'Rate this conversation'}
                  </p>
                  <div className="flex justify-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setTempRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= tempRating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 hover:text-yellow-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {tempRating > 0 && (
                    <textarea
                      value={tempComment}
                      onChange={(e) => setTempComment(e.target.value)}
                      placeholder="Any feedback? (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none text-sm mb-2"
                      rows={2}
                    />
                  )}
                  <div className="flex gap-2">
                    {tempRating > 0 && (
                      <button
                        onClick={() => handleSubmitRating(conversation.id)}
                        className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                      >
                        Submit Rating
                      </button>
                    )}
                    {ratingConversation === conversation.id && (
                      <button
                        onClick={() => {
                          setRatingConversation(null);
                          setTempRating(0);
                          setTempComment('');
                        }}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Patient Status Display */}
              {!compact && conversation.patient_status && (
                <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-700">Status Update:</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      conversation.patient_status === 'better' 
                        ? 'bg-green-100 text-green-700'
                        : conversation.patient_status === 'same'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {conversation.patient_status === 'better' ? '✓ Feeling Better' :
                       conversation.patient_status === 'same' ? '~ About the Same' :
                       '✗ Feeling Worse'}
                    </span>
                  </div>
                </div>
              )}

              {/* Diagnosis Summary */}
              {conversation.final_diagnosis && !compact && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <div className="text-sm mb-2">
                    <span className="font-semibold text-gray-900">Diagnosis:</span>{' '}
                    <span className="text-gray-700">{conversation.final_diagnosis.diagnosis}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold text-gray-900">Recommendation:</span>{' '}
                    <span className="text-gray-700">{conversation.final_diagnosis.recommendation}</span>
                  </div>
                  {conversation.final_diagnosis.confidence && (
                    <div className="text-xs text-gray-600 mt-2">
                      Confidence: {conversation.final_diagnosis.confidence}%
                    </div>
                  )}
                </div>
              )}

              {/* Message Count */}
              {!compact && (
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}
                  </div>
                  
                  {/* View Full Conversation Button */}
                  <button
                    onClick={() => setExpandedConversation(
                      expandedConversation === conversation.id ? null : conversation.id
                    )}
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    <span>
                      {expandedConversation === conversation.id
                        ? 'Hide Conversation'
                        : 'View Conversation'}
                    </span>
                    <ArrowDown
                      className={`w-4 h-4 transform transition-transform ${
                        expandedConversation === conversation.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Full Conversation */}
              {expandedConversation === conversation.id && !compact && (
                <div className="mt-4 border-t pt-4 space-y-3 max-h-96 overflow-y-auto">
                  {conversation.messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.isBot
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Conversation?</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this conversation? All messages and analysis will be permanently removed.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteConversation(showDeleteConfirm)}
                disabled={deletingId === showDeleteConfirm}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingId === showDeleteConfirm ? 'Deleting...' : 'Delete'}
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deletingId === showDeleteConfirm}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}