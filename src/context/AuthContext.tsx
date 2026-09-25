import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { isLocalMode, supabase } from '../lib/supabase';
import {
  getActiveSession,
  saveActiveSession,
  clearActiveSession,
  loginLocalAccount,
  loginAsDemo,
} from '../lib/authService';

export interface Company {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  siret?: string;
  siren?: string;
  registre_vtc?: string;
  tva_regime?: 'franchise' | 'assujetti';
  tva_number?: string;
  welcome_message?: string;
  logo_color?: string;
}

export interface Profile {
  id: string;
  company_id: string;
  full_name: string;
  phone?: string;
  driver_card_number?: string;
  role: 'admin' | 'driver';
  email?: string;
  company?: Company;
}

export interface AuthUser {
  id: string;
  email?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  isLocal: boolean;
  signOut: () => Promise<void>;
  loginWithLocal: (email: string, password: string) => { success: boolean; error?: string };
  loginDemo: () => void;
  setSession: (user: AuthUser, profile: Profile) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchSupabaseProfile(userId: string) {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, company:companies(*)')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.warn('Could not fetch Supabase profile, falling back:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // 1. Vérifier si une session locale existe
    const saved = getActiveSession();
    if (saved) {
      setUser(saved.user);
      setProfile(saved.profile);
      setLoading(false);
      return;
    }

    // 2. Si pas de session locale et Supabase activé, vérifier la session Supabase
    if (!isLocalMode && supabase) {
      supabase.auth.getSession().then(({ data: { session } }: any) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email });
          fetchSupabaseProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }).catch(() => {
        setUser(null);
        setProfile(null);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email });
          fetchSupabaseProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    }

    // 3. Mode local sans session active : l'utilisateur doit se connecter ou créer un compte
    setUser(null);
    setProfile(null);
    setLoading(false);
  }, []);

  const loginWithLocal = (email: string, password: string) => {
    const res = loginLocalAccount(email, password);
    if (res.success && res.user && res.profile) {
      setUser(res.user);
      setProfile(res.profile);
      return { success: true };
    }
    return { success: false, error: res.error || 'Identifiants invalides' };
  };

  const loginDemo = () => {
    const res = loginAsDemo();
    setUser(res.user);
    setProfile(res.profile);
  };

  const setSession = (u: AuthUser, p: Profile) => {
    setUser(u);
    setProfile(p);
    saveActiveSession(u, p);
  };

  const signOut = async () => {
    clearActiveSession();
    if (!isLocalMode && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out error:', err);
      }
    }
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isLocal: isLocalMode,
        signOut,
        loginWithLocal,
        loginDemo,
        setSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
