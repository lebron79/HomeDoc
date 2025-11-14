import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  caseId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!profile?.id) return;

    // Subscribe to medical_cases changes for patients
    if (profile.role === 'patient') {
      const channel = supabase
        .channel('case-notifications')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'medical_cases',
            filter: `patient_id=eq.${profile.id}`
          },
          async (payload) => {
            const oldStatus = (payload.old as any).status;
            const newStatus = (payload.new as any).status;
            
            // Notify when case is accepted
            if (oldStatus === 'pending' && newStatus === 'accepted') {
              // Fetch doctor name
              const doctorId = (payload.new as any).doctor_id;
              const { data: doctor } = await supabase
                .from('user_profiles')
                .select('full_name')
                .eq('id', doctorId)
                .single();

              addNotification({
                title: '🎉 Case Accepted!',
                message: `Dr. ${doctor?.full_name || 'Your doctor'} has accepted your case. You can now message them!`,
                type: 'success',
                caseId: (payload.new as any).id
              });

              // Play notification sound
              playNotificationSound();
            }

            // Notify when case is in progress
            if (oldStatus === 'accepted' && newStatus === 'in_progress') {
              const doctorId = (payload.new as any).doctor_id;
              const { data: doctor } = await supabase
                .from('user_profiles')
                .select('full_name')
                .eq('id', doctorId)
                .single();

              addNotification({
                title: '👨‍⚕️ Case In Progress',
                message: `Dr. ${doctor?.full_name || 'Your doctor'} is now working on your case.`,
                type: 'info',
                caseId: (payload.new as any).id
              });
            }

            // Notify when case is completed
            if (newStatus === 'completed') {
              const doctorId = (payload.new as any).doctor_id;
              const { data: doctor } = await supabase
                .from('user_profiles')
                .select('full_name')
                .eq('id', doctorId)
                .single();

              addNotification({
                title: '✅ Case Completed',
                message: `Your case with Dr. ${doctor?.full_name || 'your doctor'} has been completed.`,
                type: 'success',
                caseId: (payload.new as any).id
              });

              playNotificationSound();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile?.id, profile?.role]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 10000);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const playNotificationSound = () => {
    // Create a pleasant notification sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
