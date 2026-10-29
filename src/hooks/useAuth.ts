import { useState, useEffect, useCallback } from 'react';
import type { User as SupabaseAuthUser, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import type { User, UserRole, CustomerProfile, RouterOwnerProfile } from '../types/index.ts';

export interface AuthState {
  session: Session | null;
  supabaseUser: SupabaseAuthUser | null;
  user: User | null;
  customerProfile: CustomerProfile | null;
  ownerProfile: RouterOwnerProfile | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    supabaseUser: null,
    user: null,
    customerProfile: null,
    ownerProfile: null,
    loading: true,
    error: null,
  });

  // Helper to map Supabase auth user into application User type
  const mapSupabaseUserToAppUser = useCallback(
    (sbUser: SupabaseAuthUser | null, session: Session | null): User | null => {
      if (!sbUser) return null;

      const metadata = sbUser.user_metadata || {};
      const role: UserRole =
        metadata.role === 'SUPER_ADMIN'
          ? 'SUPER_ADMIN'
          : metadata.role === 'ROUTER_OWNER'
          ? 'ROUTER_OWNER'
          : 'CUSTOMER';

      return {
        id: sbUser.id,
        email: sbUser.email || '',
        name: metadata.name || sbUser.email?.split('@')[0] || 'User',
        phone: metadata.phone || '07XXXXXXXX',
        role,
        createdAt: sbUser.created_at || new Date().toISOString(),
        status: 'ACTIVE',
      };
    },
    []
  );

  // Sync user state and listen to Supabase auth events
  useEffect(() => {
    let isMounted = true;

    // 1. Initial session fetch
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (isMounted) {
          const appUser = mapSupabaseUserToAppUser(data.session?.user || null, data.session);
          setAuthState({
            session: data.session,
            supabaseUser: data.session?.user || null,
            user: appUser,
            customerProfile: null,
            ownerProfile: null,
            loading: false,
            error: null,
          });
        }
      } catch (err: any) {
        if (isMounted) {
          setAuthState((prev) => ({
            ...prev,
            loading: false,
            error: err?.message || null,
          }));
        }
      }
    };

    getInitialSession();

    // 2. Real-time auth state listener: ensures UI reacts instantly
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        const appUser = mapSupabaseUserToAppUser(session?.user || null, session);

        setAuthState((prev) => ({
          ...prev,
          session,
          supabaseUser: session?.user || null,
          user: appUser,
          loading: false,
          error: null,
        }));
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [mapSupabaseUserToAppUser]);

  // Sign In with email and password
  const signIn = useCallback(
    async (email: string, password: string): Promise<{ user: User | null; session: Session | null }> => {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        const appUser = mapSupabaseUserToAppUser(data.user, data.session);
        setAuthState((prev) => ({
          ...prev,
          session: data.session,
          supabaseUser: data.user,
          user: appUser,
          loading: false,
          error: null,
        }));

        return { user: appUser, session: data.session };
      } catch (err: any) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: err?.message || 'Login failed',
        }));
        throw err;
      }
    },
    [mapSupabaseUserToAppUser]
  );

  // Sign Up with email, password, and custom profile metadata
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      metadata: { name: string; phone: string; role: 'CUSTOMER' | 'ROUTER_OWNER' | 'SUPER_ADMIN' }
    ): Promise<{ user: User | null; session: Session | null }> => {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: metadata.name,
              phone: metadata.phone,
              role: metadata.role,
            },
          },
        });

        if (error) throw error;

        const appUser = mapSupabaseUserToAppUser(data.user, data.session);
        setAuthState((prev) => ({
          ...prev,
          session: data.session,
          supabaseUser: data.user,
          user: appUser,
          loading: false,
          error: null,
        }));

        return { user: appUser, session: data.session };
      } catch (err: any) {
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: err?.message || 'Sign up failed',
        }));
        throw err;
      }
    },
    [mapSupabaseUserToAppUser]
  );

  // Sign Out
  const signOut = useCallback(async (): Promise<void> => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setAuthState({
        session: null,
        supabaseUser: null,
        user: null,
        customerProfile: null,
        ownerProfile: null,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: err?.message || 'Sign out failed',
      }));
      throw err;
    }
  }, []);

  // Force session refresh
  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;

      const appUser = mapSupabaseUserToAppUser(data.session?.user || null, data.session);
      setAuthState((prev) => ({
        ...prev,
        session: data.session,
        supabaseUser: data.session?.user || null,
        user: appUser,
      }));
    } catch (err: any) {
      console.warn('[useAuth] Session refresh failed:', err);
    }
  }, [mapSupabaseUserToAppUser]);

  return {
    ...authState,
    isConfigured: isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };
}
