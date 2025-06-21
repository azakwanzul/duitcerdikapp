import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  updateProfile: (userData: any) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle user profile creation on sign up
      if (event === 'SIGNED_UP' && session?.user) {
        // The user profile will be created in the signUp function
      }

      // Handle logout - clear any cached data
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        // Clear any local storage data if needed
        localStorage.removeItem('duitcerdik-onboarding-complete');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { user: null, error };
      }

      // Create user profile in the users table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name: userData.name,
            occupation: userData.occupation,
            monthly_income: userData.monthlyIncome,
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }

        // Create default user settings
        const { error: settingsError } = await supabase
          .from('user_settings')
          .insert({
            user_id: data.user.id,
            dark_mode: true,
            notifications: true,
            currency: 'RM',
            language: 'en',
          });

        if (settingsError) {
          console.error('Error creating user settings:', settingsError);
        }

        // Create welcome notification
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: data.user.id,
            type: 'general',
            title: 'Welcome to DuitCerdik!',
            message: 'Start your financial journey by adding your first transaction or setting up a savings goal.',
          });

        if (notificationError) {
          console.error('Error creating welcome notification:', notificationError);
        }
      }

      return { user: data.user, error: null };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { user: data.user, error };
    } catch (error) {
      return { user: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Clear any additional local data
      localStorage.removeItem('duitcerdik-onboarding-complete');
      
      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const updateProfile = async (userData: any) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      const { error } = await supabase
        .from('users')
        .update({
          name: userData.name,
          occupation: userData.occupation,
          monthly_income: userData.monthlyIncome,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}