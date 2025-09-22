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

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('Fetching role for user:', userId);
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      
      console.log('Role data:', roleData);
      return roleData?.role || null;
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const handleAuthStateChange = async (event: string, session: Session | null) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      if (!mounted) return;

      if (session?.user) {
        const role = await fetchUserRole(session.user.id);
        
        if (mounted) {
          console.log('Setting auth state with role:', role);
          setAuthState({
            user: session.user,
            session,
            role,
            loading: false,
          });
        }
      } else {
        if (mounted) {
          console.log('Setting auth state to null');
          setAuthState({
            user: null,
            session: null,
            role: null,
            loading: false,
          });
        }
      }
    };

    // Check for existing session first
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setAuthState(prev => ({ ...prev, loading: false }));
          return;
        }

        await handleAuthStateChange('INITIAL_SESSION', session);
        
        // Set up auth state listener after initial session check
        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
        
        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (mounted) {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
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