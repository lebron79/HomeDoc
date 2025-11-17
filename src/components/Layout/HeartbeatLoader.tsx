import { Heart } from 'lucide-react';

export function HeartbeatLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 relative overflow-hidden">
      {/* Background pulse circles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-64 h-64 bg-red-200 rounded-full opacity-20 animate-ping" style={{ animationDuration: '2s' }}></div>
        <div className="absolute w-48 h-48 bg-rose-300 rounded-full opacity-30 animate-ping" style={{ animationDuration: '1.5s' }}></div>
        <div className="absolute w-32 h-32 bg-pink-300 rounded-full opacity-40 animate-ping" style={{ animationDuration: '1s' }}></div>
      </div>

      <div className="text-center relative z-10">
        {/* Heartbeat animation */}
        <div className="relative mb-8">
          <div className="heartbeat-container">
            <Heart className="w-20 h-20 text-red-500 fill-red-500" />
          </div>
        </div>

        {/* ECG Line */}
        <div className="mb-6 flex items-center justify-center">
          <svg width="200" height="60" viewBox="0 0 200 60" className="ecg-line">
            <path
              d="M 0 30 L 40 30 L 45 10 L 50 50 L 55 30 L 60 30 L 80 30 L 85 10 L 90 50 L 95 30 L 100 30 L 120 30 L 125 10 L 130 50 L 135 30 L 140 30 L 160 30 L 165 10 L 170 50 L 175 30 L 200 30"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-red-500"
            />
          </svg>
        </div>

        {/* Text */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">HomeDoc</h2>
        <p className="text-gray-600 animate-pulse">Loading your health companion...</p>

        {/* Dots animation */}
        <div className="flex justify-center gap-2 mt-4">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>

      <style>{`
        .heartbeat-container {
          animation: heartbeat 1.2s ease-in-out infinite;
        }

        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          10% {
            transform: scale(1.1);
          }
          20% {
            transform: scale(1);
          }
          30% {
            transform: scale(1.2);
          }
          40% {
            transform: scale(1);
          }
        }

        .ecg-line path {
          stroke-dasharray: 200;
          stroke-dashoffset: 200;
          animation: ecg 2s linear infinite;
        }

        @keyframes ecg {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
