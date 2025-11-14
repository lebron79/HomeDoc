import { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  Loader2,
  Brain,
  AlertTriangle,
  Save,
  Sparkles,
  Star,
} from 'lucide-react';
import { analyzeSymptomsWithGemini, GeminiResponse, generateConversationTitle } from '../../lib/gemini';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  type?: 'text' | 'analysis';
  analysis?: GeminiResponse;
  source?: 'gemini' | 'fallback';
  rawGemini?: string;
}

interface SymptomCheckerProps {
  onClose?: () => void;
}

export function SymptomChecker({ onClose }: SymptomCheckerProps) {
  const { user } = useAuth();
  
  // State management
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text:
        "Hello! I'm your AI Health Assistant from HomeDoc. Please describe your symptoms and I'll help you understand what might be going on.",
      isBot: true,
      timestamp: new Date(),
      type: 'text',
      source: 'gemini',
    },
  ]);
  const [input, setInput] = useState('');
  const [currentSymptoms, setCurrentSymptoms] = useState<string[]>([]);
  const [step, setStep] = useState<'collecting' | 'severity' | 'analyzing' | 'complete' | 'status' | 'rating'>('collecting');
  const [isProcessing, setIsProcessing] = useState(false);
  const [geminiAnalysis, setGeminiAnalysis] = useState<GeminiResponse | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [conversationTitle, setConversationTitle] = useState<string>('');
  const [savedConversationId, setSavedConversationId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [showRatingSection, setShowRatingSection] = useState(false);
  const chatRef = useRef<string[]>([]);
  const conversationCountRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);

  // Auto-scroll to bottom within chat container only - don't scroll the page
  useEffect(() => {
    if (chatContainerRef.current && shouldScrollRef.current) {
      // Scroll the chat container to bottom, not the whole page
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      // Reset the flag after scrolling
      shouldScrollRef.current = false;
    }
  }, [messages]);

  useEffect(() => {
    // Initialize chat history on component mount
    chatRef.current = [];
    // Auto-generate conversation title from first symptom
    if (currentSymptoms.length > 0 && !conversationTitle) {
      const firstSymptom = currentSymptoms[0].substring(0, 50);
      setConversationTitle(firstSymptom + (currentSymptoms[0].length > 50 ? '...' : ''));
    }
  }, [currentSymptoms, conversationTitle]);

  /* ------------------------------------------------------------------ */
  // Save conversation to database
  const saveConversation = async (): Promise<boolean> => {
    if (!user) {
      alert('Please log in to save your conversation');
      return false;
    }

    if (isSaved) {
      return true; // Already saved
    }

    setIsSaving(true); // Start saving/title generation

    try {
      const mappedSeverity =
        geminiAnalysis?.severity === 'high'
          ? 'severe'
          : geminiAnalysis?.severity === 'medium'
          ? 'moderate'
          : 'mild';

      // Generate conversation text for AI title generation
      const conversationText = messages
        .map(msg => `${msg.isBot ? 'AI' : 'Patient'}: ${msg.text}`)
        .join('\n');

      // Use AI to generate a smart, contextual title
      let generatedTitle = 'Health Consultation';
      try {
        generatedTitle = await generateConversationTitle(conversationText);
      } catch (error) {
        console.error('Error generating title with AI:', error);
        // Fallback to diagnosis-based title
        generatedTitle = conversationTitle || 
          (geminiAnalysis?.diagnosis ? geminiAnalysis.diagnosis.substring(0, 60) : 'Health Consultation');
      }

      const serializedMessages = messages.map(msg => ({
        text: msg.text,
        isBot: msg.isBot,
        timestamp: msg.timestamp.toISOString(),
        type: msg.type,
      }));

      const conversationData = {
        user_id: user.id,
        conversation_type: 'symptom_check' as const,
        title: generatedTitle,
        messages: serializedMessages,
        final_diagnosis: geminiAnalysis,
        severity: mappedSeverity,
        rating: rating > 0 ? rating : null,
        rating_comment: ratingComment || null,
      };

      const { data, error } = await supabase
        .from('ai_conversations')
        .insert(conversationData)
        .select('id')
        .single();

      if (error) throw error;

      setIsSaved(true);
      setSavedConversationId(data.id); // Store the conversation ID
      setConversationTitle(generatedTitle); // Update local state with AI-generated title
      
      // Don't auto-close - let user rate first
      // The onClose will be triggered manually when they click close button
      
      return true;
    } catch (error) {
      console.error('Error saving conversation:', error);
      alert('Failed to save conversation. Please try again.');
      return false;
    } finally {
      setIsSaving(false); // End saving
    }
  };

  /* ------------------------------------------------------------------ */
  // Handle close with save check
  const handleClose = () => {
    if (!isSaved && (currentSymptoms.length > 0 || messages.length > 1)) {
      setShowSaveDialog(true);
    } else if (onClose) {
      // Trigger refresh when closing
      onClose();
    }
  };

  /* ------------------------------------------------------------------ */
  const addMessage = (
    text: string,
    isBot: boolean,
    type: 'text' | 'analysis' = 'text',
    analysis?: GeminiResponse,
    source?: 'gemini' | 'fallback',
    rawGemini?: string
  ) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      text,
      isBot,
      timestamp: new Date(),
      type,
      analysis,
      source,
      rawGemini,
    };
    setMessages((p) => [...p, newMsg]);
  };

  /* ------------------------------------------------------------------ */
  const getChatResponseFromGemini = async (userMessage: string): Promise<{
    text: string;
    source: 'gemini' | 'fallback';
    raw?: string;
  }> => {
    try {
      conversationCountRef.current += 1;
      
      // Add message to history
      if (!chatRef.current) {
        chatRef.current = [];
      }
      chatRef.current.push(userMessage);

      // Use our centralized Gemini service
      const response = await analyzeSymptomsWithGemini(
        `Previous symptoms: ${currentSymptoms.join(', ') || 'None mentioned yet'}\n\nPatient's message: ${userMessage}\n\nProvide a brief, empathetic response and ask ONE relevant follow-up question about timing, severity, triggers, or related symptoms.`,
        'mild' // We use mild here as this is just for chat, not final analysis
      );

      // Extract the response and ensure it's conversational
      const text = response.additionalNotes || response.recommendation || "I understand. Can you tell me when these symptoms first started?";

      console.groupCollapsed(`Gemini Response #${conversationCountRef.current}`);
      console.log('User Input:', userMessage);
      console.log('Gemini Analysis:', response);
      console.groupEnd();

      return { text, source: 'gemini', raw: text };
    } catch (error: any) {
      console.error('Gemini API Failed → Using Fallback', error.message || error);

      const fallbacks = [
        "I understand. Can you tell me when these symptoms first started?",
        "Thank you for sharing. How long have you been experiencing this?",
        "I see. Does anything make these symptoms better or worse?",
        "Got it. Are there any other symptoms you've noticed?",
        "Thanks for the details. Is the symptom constant or does it come and go?",
        "I hear you. Have you noticed any patterns with food, stress, or activity?",
      ];
      const text = fallbacks[conversationCountRef.current % fallbacks.length];
      return { text, source: 'fallback' };
    }
  };

  /* ------------------------------------------------------------------ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userInput = input.trim();
    shouldScrollRef.current = true; // Enable scroll when submitting message
    addMessage(userInput, false);
    setCurrentSymptoms((p) => [...p, userInput]);
    setInput('');
    setIsProcessing(true);

    try {
      const { text, source, raw } = await getChatResponseFromGemini(userInput);
      setTimeout(() => {
        shouldScrollRef.current = true; // Enable scroll for bot response
        addMessage(text, true, 'text', undefined, source, raw);
        setIsProcessing(false);
      }, 800);
    } catch (err) {
      shouldScrollRef.current = true; // Enable scroll for error message
      addMessage("I'm having trouble connecting right now. Please try again.", true, 'text', undefined, 'fallback');
      setIsProcessing(false);
    }
  };

  /* ------------------------------------------------------------------ */
  const handleDone = async () => {
    if (currentSymptoms.length === 0) return;
    
    const symptomsText = currentSymptoms.join('. ');
    setStep('analyzing');
    setIsProcessing(true);
    shouldScrollRef.current = true; // Enable scroll for analysis
    addMessage(`Analyzing your symptoms with HomeDoc AI...`, true, 'text', undefined, 'gemini');

    try {
      // Auto-detect severity based on symptoms
      const analysis = await analyzeSymptomsWithGemini(symptomsText, 'moderate');
      setGeminiAnalysis(analysis);
      shouldScrollRef.current = true; // Enable scroll for results
      addMessage('', true, 'analysis', analysis, 'gemini');
      setStep('complete'); // Go straight to complete, skip status/rating
    } catch (error) {
      console.error('Error analysing symptoms:', error);
      addMessage(
        'Sorry, I encountered an error while analysing your symptoms. Please try again or consult a healthcare provider.',
        true,
        'text',
        undefined,
        'fallback'
      );
      setStep('collecting');
    } finally {
      setIsProcessing(false);
    }
  };

  /* ------------------------------------------------------------------ */
  return (
    <div className="flex flex-col relative z-10">
      {/* Chat Messages - Reduced height */}
      <div 
        ref={chatContainerRef}
        className="h-[400px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-200/50 shadow-inner">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.isBot ? 'bg-gray-100 text-gray-900' : 'bg-red-600 text-white'
              }`}
            >
              {msg.type === 'analysis' && msg.analysis ? (
                /* ------------------- ANALYSIS RESULT ------------------- */
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-600">AI Analysis Complete</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">Diagnosis:</h4>
                      <p className="text-sm text-gray-700">{msg.analysis.diagnosis}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900">Recommendation:</h4>
                      <p className="text-sm text-gray-700">{msg.analysis.recommendation}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          msg.analysis.severity === 'high'
                            ? 'bg-red-100 text-red-800'
                            : msg.analysis.severity === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {msg.analysis.severity.toUpperCase()} RISK
                      </div>
                      <div className="text-xs text-gray-500">
                        Confidence: {msg.analysis.confidence}%
                      </div>
                    </div>

                    {msg.analysis.requiresDoctor && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-700 font-medium">
                          Doctor consultation recommended
                        </span>
                      </div>
                    )}

                    {msg.analysis.additionalNotes && (
                      <div className="text-xs text-gray-600 italic">{msg.analysis.additionalNotes}</div>
                    )}
                  </div>
                </div>
              ) : (
                /* ------------------- NORMAL MESSAGE ------------------- */
                <>
                  <p className="text-sm">{msg.text}</p>

                  {/* DEBUG BADGE */}
                  {msg.source && (
                    <div className="mt-1 flex items-center gap-1 text-xs opacity-70">
                      {msg.source === 'gemini' ? (
                        <>
                          <Brain className="w-3 h-3" />
                          <span>HomeDoc AI</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3" />
                          <span>Fallback</span>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                <span className="text-sm text-gray-600">HomeDoc is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ------------------- COLLECTING SYMPTOMS ------------------- */}
      {step === 'collecting' && (
        <div className="bg-white border-t-2 border-gray-200 p-4 rounded-b-xl">
          <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your symptoms..."
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing || !input.trim()}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2.5 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {currentSymptoms.length > 0 && (
            <button
              onClick={handleDone}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2.5 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
            >
              ✓ Done describing symptoms
            </button>
          )}
        </div>
      )}

      {/* ------------------- COMPLETE ------------------- */}
      {step === 'complete' && (
        <div className="bg-white border-t-2 border-gray-200 p-4 space-y-2.5 rounded-b-xl">
          <div className="text-center mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Analysis Complete!</h3>
            <p className="text-xs text-gray-600 mt-0.5">
              {isSaved ? 'Saved to your history' : 'Your diagnosis is ready'}
            </p>
          </div>

          <div className="space-y-2.5">
            {/* Save Button */}
            {!isSaved && (
              <button
                onClick={async () => {
                  const saved = await saveConversation();
                  if (saved) {
                    setShowRatingSection(true);
                  }
                }}
                disabled={isSaving}
                className={`w-full py-2.5 rounded-xl transition-colors font-medium flex items-center justify-center gap-2 text-sm ${
                  isSaving
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 shadow-md hover:shadow-lg border-2 border-teal-600'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save to History
                  </>
                )}
              </button>
            )}

            {/* Saved confirmation with title */}
            {isSaved && (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 py-3 rounded-lg border border-green-200">
                  <Brain className="w-5 h-5" />
                  <span className="font-medium">Saved to History</span>
                </div>
                {conversationTitle && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-red-900 mb-1">AI-Generated Title:</p>
                        <p className="text-sm text-gray-800 font-medium">{conversationTitle}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Optional Rating Section - Only shows after save */}
            {isSaved && showRatingSection && (
              <div className="border-t pt-3 mt-3 relative z-20">
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 shadow-lg">
                  <p className="text-sm font-semibold text-gray-900 mb-3 text-center">
                    How helpful was this diagnosis? (Optional)
                  </p>
                  <div className="flex justify-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 hover:text-yellow-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  
                  {rating > 0 && (
                    <textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      placeholder="Any feedback? (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none text-sm text-gray-900 placeholder-gray-400"
                      rows={2}
                    />
                  )}

                  <div className="flex gap-2 mt-3">
                    {rating > 0 && (
                      <button
                        onClick={async () => {
                          // Update the conversation with rating
                          if (!savedConversationId) {
                            console.error('No conversation ID available');
                            alert('Error: No conversation ID found. Please try saving the conversation first.');
                            return;
                          }
                          
                          console.log('Submitting rating:', { rating, ratingComment, conversationId: savedConversationId });
                          
                          try {
                            const { data, error } = await supabase
                              .from('ai_conversations')
                              .update({ 
                                rating: rating,
                                rating_comment: ratingComment || null 
                              })
                              .eq('id', savedConversationId)
                              .select();
                            
                            console.log('Rating update result:', { data, error });
                            
                            if (!error && data && data.length > 0) {
                              addMessage(
                                `Thank you for your ${rating}-star rating! ⭐`,
                                true,
                                'text',
                                undefined,
                                'gemini'
                              );
                              // Hide rating section and trigger refresh
                              setTimeout(() => {
                                setShowRatingSection(false);
                                // Call onClose to trigger parent refresh
                                if (onClose) {
                                  onClose();
                                }
                              }, 1500);
                            } else {
                              console.error('Error saving rating:', error);
                              alert(`Failed to save rating. ${error?.message || 'Please try again.'}`);
                            }
                          } catch (error) {
                            console.error('Error saving rating:', error);
                            alert('Failed to save rating. Please try again.');
                          }
                        }}
                        className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                      >
                        Submit Rating
                      </button>
                    )}
                    <button
                      onClick={() => setShowRatingSection(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                    >
                      {rating > 0 ? 'Cancel' : 'Skip'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                // If conversation was saved, trigger refresh before resetting
                const wasSaved = isSaved;
                
                setStep('collecting');
                setCurrentSymptoms([]);
                setIsSaved(false);
                setConversationTitle('');
                setRating(0);
                setRatingComment('');
                setShowRatingSection(false);
                chatRef.current = [];
                conversationCountRef.current = 0;
                setMessages([
                  {
                    id: '1',
                    text:
                      "Hello! I'm your AI Health Assistant from HomeDoc. Please describe your symptoms and I'll help you understand what might be going on.",
                    isBot: true,
                    timestamp: new Date(),
                    type: 'text',
                    source: 'gemini',
                  },
                ]);
                
                // Trigger refresh if a conversation was saved
                if (wasSaved && onClose) {
                  setTimeout(() => {
                    onClose();
                  }, 100);
                }
              }}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-2.5 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all font-medium shadow-md text-sm"
            >
              New Symptom Check
            </button>

            {onClose && (
              <button
                onClick={handleClose}
                className="w-full bg-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-300 transition-all font-medium text-sm"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* ------------------- SAVE CONFIRMATION DIALOG ------------------- */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Save Conversation?</h3>
                <p className="text-sm text-gray-600">You have unsaved changes</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Would you like to save this conversation to your history before closing?
            </p>
            
            <div className="space-y-2">
              <button
                onClick={async () => {
                  const saved = await saveConversation();
                  if (saved && onClose) {
                    setShowSaveDialog(false);
                    onClose();
                  }
                }}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save & Close
              </button>
              
              <button
                onClick={() => {
                  if (onClose) {
                    setShowSaveDialog(false);
                    onClose();
                  }
                }}
                className="w-full bg-red-100 text-red-700 py-3 rounded-lg hover:bg-red-200 transition-colors font-medium"
              >
                Close Without Saving
              </button>
              
              <button
                onClick={() => setShowSaveDialog(false)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
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