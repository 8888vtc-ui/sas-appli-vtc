import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { isLocalMode, supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface Company {
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

interface Profile {
  id: string;
  company_id: string;
  full_name: string;
  phone?: string;
  driver_card_number?: string;
  role: 'admin' | 'driver';
  company?: Company;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLocalMode) {
      // Mode Local Storage
      const localProfile = localStorage.getItem('vtc_local_profile');
      if (localProfile) {
        const parsed = JSON.parse(localProfile);
        setUser({ id: 'local-user', email: 'local@vtc.pro' } as any);
        setProfile(parsed);
      }
      setLoading(false);
      return;
    }

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, company:companies(*)')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
