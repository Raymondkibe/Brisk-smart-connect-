import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabaseClient, isSupabaseConfigured } from '../services/supabaseClient.ts';
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

const LOCAL_STORAGE_USER_KEY = 'brisk_active_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode; initialUser: User | null }> = ({
  children,
  initialUser,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (initialUser) return initialUser;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        if (stored) return JSON.parse(stored);
      } catch {
        // ignore JSON parse error
      }
    }
    return null;
  });

  const [supabaseUser, setSupabaseUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync state to localStorage whenever currentUser updates
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentUser) {
        try {
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(currentUser));
        } catch {
          // ignore
        }
      } else {
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      }
    }
  }, [currentUser]);

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
        } = await supabaseClient.auth.getSession();

        if (mounted) {
          setSession(activeSession);
          setSupabaseUser(activeSession?.user || null);

          if (activeSession?.user) {
            const email = activeSession.user.email || '';
            let role: User['role'] = 'CUSTOMER';
            if (email.includes('admin') || activeSession.user.user_metadata?.role === 'SUPER_ADMIN') {
              role = 'SUPER_ADMIN';
            } else if (email.includes('owner') || activeSession.user.user_metadata?.role === 'ROUTER_OWNER') {
              role = 'ROUTER_OWNER';
            }

            const mappedUser: User = {
              id: activeSession.user.id,
              name: activeSession.user.user_metadata?.name || activeSession.user.email?.split('@')[0] || 'User',
              email: activeSession.user.email || '',
              phone: activeSession.user.user_metadata?.phone || '0712345678',
              role: role,
              status: 'ACTIVE',
              createdAt: activeSession.user.created_at || new Date().toISOString(),
            };

            setCurrentUser(mappedUser);
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
    } = supabaseClient.auth.onAuthStateChange((_event, currentSession) => {
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
        await supabaseClient.auth.signOut();
      } catch (e) {
        console.warn('[AuthContext] SignOut error:', e);
      }
    }
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
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
