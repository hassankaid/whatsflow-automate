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

  const fetchUserRole = async (userId: string): Promise<AppRole> => {
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
      
      console.log('Role data received:', roleData);
      return (roleData?.role as AppRole) || null;
    } catch (error) {
      console.error('Exception in fetchUserRole:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const handleAuthStateChange = async (event: string, session: Session | null) => {
      console.log('🔄 Auth state change:', event, session?.user?.email);
      
      if (!mounted) {
        console.log('⚠️ Component unmounted, skipping update');
        return;
      }

      try {
        if (session?.user) {
          console.log('👤 User session found, fetching role...');
          const role = await fetchUserRole(session.user.id);
          
          if (mounted) {
            console.log('✅ Setting auth state - User:', session.user.email, 'Role:', role);
            setAuthState({
              user: session.user,
              session,
              role,
              loading: false,
            });
          }
        } else {
          console.log('❌ No session, setting to logged out state');
          if (mounted) {
            setAuthState({
              user: null,
              session: null,
              role: null,
              loading: false,
            });
          }
        }
      } catch (error) {
        console.error('❌ Error in handleAuthStateChange:', error);
        if (mounted) {
          setAuthState({
            user: null,
            session: null,
            role: null,
            loading: false,
          });
        }
      }
    };

    const initAuth = async () => {
      console.log('🚀 Initializing auth...');
      
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          if (mounted) {
            setAuthState(prev => ({ ...prev, loading: false }));
          }
          return;
        }

        console.log('📋 Initial session check complete');
        await handleAuthStateChange('INITIAL_SESSION', session);

      } catch (error) {
        console.error('❌ Error in initAuth:', error);
        if (mounted) {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    // Initialize and set up listener
    initAuth();

    // Set up auth change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      console.log('🧹 Cleaning up auth hook');
      mounted = false;
      subscription.unsubscribe();
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