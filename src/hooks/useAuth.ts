import { useState, useEffect, useCallback } from 'react';
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

  const [roleCache, setRoleCache] = useState<Map<string, AppRole>>(new Map());

  const fetchUserRole = useCallback(async (userId: string): Promise<AppRole> => {
    // Check cache first
    if (roleCache.has(userId)) {
      return roleCache.get(userId)!;
    }

    try {
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      
      const role = (roleData?.role as AppRole) || null;
      
      // Cache the result
      setRoleCache(prev => new Map(prev).set(userId, role));
      
      return role;
    } catch (error) {
      console.error('Exception in fetchUserRole:', error);
      return null;
    }
  }, [roleCache]);

  useEffect(() => {
    let mounted = true;
    let roleTimeout: NodeJS.Timeout;

    const handleAuthStateChange = (event: string, session: Session | null) => {
      if (!mounted) return;

      if (session?.user) {
        // Set initial state immediately
        setAuthState(prev => ({
          ...prev,
          user: session.user,
          session,
          loading: false,
        }));

        // Clear any existing timeout
        if (roleTimeout) {
          clearTimeout(roleTimeout);
        }

        // Fetch role with debouncing
        roleTimeout = setTimeout(async () => {
          if (mounted) {
            try {
              const role = await fetchUserRole(session.user.id);
              if (mounted) {
                setAuthState(prev => ({ ...prev, role }));
              }
            } catch (error) {
              console.error('Error fetching user role:', error);
              if (mounted) {
                setAuthState(prev => ({ ...prev, role: null }));
              }
            }
          }
        }, 100); // 100ms debounce
      } else {
        setAuthState({
          user: null,
          session: null,
          role: null,
          loading: false,
        });
        // Clear cache when user logs out
        setRoleCache(new Map());
      }
    };

    const initAuth = async () => {
      if (!mounted) return;
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setAuthState(prev => ({ ...prev, loading: false }));
          }
          return;
        }

        handleAuthStateChange('INITIAL_SESSION', session);

      } catch (error) {
        console.error('Error in initAuth:', error);
        if (mounted) {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    // Initialize
    initAuth();

    // Set up auth change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      mounted = false;
      if (roleTimeout) {
        clearTimeout(roleTimeout);
      }
      subscription.unsubscribe();
    };
  }, [fetchUserRole]);

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
    // Clear cache on sign out
    setRoleCache(new Map());
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const assignRole = async (userId: string, role: 'admin' | 'client') => {
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, role });
    
    // Clear cache for this user
    setRoleCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(userId);
      return newCache;
    });
    
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