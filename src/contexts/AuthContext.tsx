import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

interface UserUsage {
  id: string;
  user_id: string;
  free_projects_used: number;
  total_exports: number;
  paid_exports: number;
  pending_charge_amount: number;
  last_export_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  usage: UserUsage | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  canExport: boolean;
  refreshUsage: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUsage = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching usage:', error);
        return;
      }

      setUsage(data);
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

  const refreshUsage = async () => {
    if (user) {
      await fetchUsage(user.id);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Defer Supabase calls with setTimeout to prevent deadlock
          setTimeout(() => {
            fetchProfile(session.user.id);
            fetchUsage(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUsage(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchProfile(session.user.id);
          fetchUsage(session.user.id);
        }, 0);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Error de inicio de sesión",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Bienvenido!",
          description: "Has iniciado sesión correctamente.",
        });
      }

      return { error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast({
          title: "Error de registro",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "¡Registro exitoso!",
          description: "Revisa tu email para verificar tu cuenta.",
        });
      }

      return { error };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setUsage(null);
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAdmin = profile?.role === 'admin';
  const canExport = !usage || usage.free_projects_used < 25 || usage.pending_charge_amount < 2.5;

  const value = {
    user,
    session,
    profile,
    usage,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
    canExport,
    refreshUsage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};