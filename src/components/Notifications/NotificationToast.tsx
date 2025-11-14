import { CheckCircle, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

const iconMap = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: XCircle
};

const colorMap = {
  success: 'bg-green-50 border-green-500 text-green-800',
  info: 'bg-blue-50 border-blue-500 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
  error: 'bg-red-50 border-red-500 text-red-800'
};

const iconColorMap = {
  success: 'text-green-600',
  info: 'text-blue-600',
  warning: 'text-yellow-600',
  error: 'text-red-600'
};

export function NotificationToast() {
  const { notifications, markAsRead } = useNotifications();

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 pointer-events-none max-w-md">
      {notifications.slice(0, 3).map((notification) => {
        const Icon = iconMap[notification.type];
        
        return (
          <div
            key={notification.id}
            className={`${colorMap[notification.type]} pointer-events-auto border-l-4 rounded-lg shadow-2xl p-4 animate-slide-in-right backdrop-blur-sm bg-opacity-95`}
            style={{
              animation: 'slideInRight 0.3s ease-out forwards'
            }}
          >
            <div className="flex items-start gap-3">
              <div className={`${iconColorMap[notification.type]} mt-0.5 flex-shrink-0`}>
                <Icon className="w-6 h-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm mb-1">
                  {notification.title}
                </p>
                <p className="text-sm opacity-90">
                  {notification.message}
                </p>
              </div>

              <button
                onClick={() => markAsRead(notification.id)}
                className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar for auto-dismiss */}
            <div className="mt-3 h-1 bg-black/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-current opacity-40 animate-shrink-width"
                style={{
                  animation: 'shrinkWidth 10s linear forwards'
                }}
              />
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes shrinkWidth {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out forwards;
        }

        .animate-shrink-width {
          animation: shrinkWidth 10s linear forwards;
        }
      `}</style>
    </div>
  );
}
