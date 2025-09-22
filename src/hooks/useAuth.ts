import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'client' | null;

interface AuthState {
  user: User | null;
  session: Session | null;
  role: AppRole;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Fetch user role when session exists
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .maybeSingle();

          setAuthState({
            user: session.user,
            session,
            role: roleData?.role || null,
            loading: false,
          });
        } else {
          setAuthState({
            user: null,
            session: null,
            role: null,
            loading: false,
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Fetch user role for existing session
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle()
          .then(({ data: roleData }) => {
            setAuthState({
              user: session.user,
              session,
              role: roleData?.role || null,
              loading: false,
            });
          });
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata: { full_name?: string; phone_number?: string } = {}) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const assignRole = async (userId: string, role: 'admin' | 'client') => {
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role });
    return { error };
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    assignRole,
    isAdmin: authState.role === 'admin',
    isClient: authState.role === 'client',
  };
};