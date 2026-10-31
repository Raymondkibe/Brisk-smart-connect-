import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import type { User } from '../types/index.ts';

interface AuthContextType {
  currentUser: User | null;
  supabaseUser: any | null;
  session: any | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode; initialUser: User | null }> = ({
  children,
  initialUser,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);
  const [supabaseUser, setSupabaseUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const {
          data: { session: activeSession },
        } = await supabase.auth.getSession();

        if (mounted) {
          setSession(activeSession);
          setSupabaseUser(activeSession?.user || null);

          if (activeSession?.user) {
            // Map Supabase auth user to application User role
            const email = activeSession.user.email || '';
            let role: User['role'] = 'CUSTOMER';
            if (email.includes('admin') || activeSession.user.user_metadata?.role === 'SUPER_ADMIN') {
              role = 'SUPER_ADMIN';
            } else if (email.includes('owner') || activeSession.user.user_metadata?.role === 'ROUTER_OWNER') {
              role = 'ROUTER_OWNER';
            }

            setCurrentUser((prev) => ({
              id: prev?.id || activeSession.user.id,
              name: activeSession.user.user_metadata?.name || activeSession.user.email?.split('@')[0] || 'User',
              email: activeSession.user.email || '',
              phone: activeSession.user.user_metadata?.phone || prev?.phone || '0712345678',
              role: role,
              status: 'ACTIVE',
              createdAt: activeSession.user.created_at || new Date().toISOString(),
            }));
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Supabase Auth initialization note:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Listen to Supabase auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      setSupabaseUser(currentSession?.user || null);

      if (currentSession?.user) {
        const email = currentSession.user.email || '';
        let role: User['role'] = 'CUSTOMER';
        if (email.includes('admin') || currentSession.user.user_metadata?.role === 'SUPER_ADMIN') {
          role = 'SUPER_ADMIN';
        } else if (email.includes('owner') || currentSession.user.user_metadata?.role === 'ROUTER_OWNER') {
          role = 'ROUTER_OWNER';
        }

        setCurrentUser({
          id: currentSession.user.id,
          name: currentSession.user.user_metadata?.name || currentSession.user.email?.split('@')[0] || 'User',
          email: currentSession.user.email || '',
          phone: currentSession.user.user_metadata?.phone || '0712345678',
          role: role,
          status: 'ACTIVE',
          createdAt: currentSession.user.created_at || new Date().toISOString(),
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('[AuthContext] SignOut error:', e);
      }
    }
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        supabaseUser,
        session,
        loading,
        login,
        logout,
        setCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
