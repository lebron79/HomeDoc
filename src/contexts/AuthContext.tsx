import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, UserProfile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: string,
    age?: number,
    phone?: string,
    gender?: string,
    address?: string,
    specialization?: string,
    licenseNumber?: string,
    yearsOfExperience?: number,
    education?: string,
    bio?: string,
    consultationFee?: number,
    doctorPhone?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    
    // Load profile after successful login
    if (data.user) {
      await loadProfile(data.user.id);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: string,
    age?: number,
    phone?: string,
    gender?: string,
    address?: string,
    specialization?: string,
    licenseNumber?: string,
    yearsOfExperience?: number,
    education?: string,
    bio?: string,
    consultationFee?: number,
    doctorPhone?: string
  ) => {
    console.log('SignUp called with role:', role);
    
    // Sign up with user metadata - the database trigger will create the profile automatically
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://lebron79.github.io/HomeDoc/confirm-email.html',
        data: {
          full_name: fullName,
          role: role,
          // Patient fields
          age: age,
          phone: phone,
          gender: gender,
          address: address,
          // Doctor fields
          specialization: specialization,
          license_number: licenseNumber,
          years_of_experience: yearsOfExperience,
          education: education,
          bio: bio,
          consultation_fee: consultationFee,
          doctor_phone: doctorPhone,
        }
      }
    });

    if (error) throw error;

    console.log('User created, waiting for trigger to create profile...');
    
    // Wait for the database trigger to complete (give it a moment)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Load the profile that was automatically created by the trigger
    if (data.user) {
      await loadProfile(data.user.id);
      console.log('Profile loaded successfully');
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}