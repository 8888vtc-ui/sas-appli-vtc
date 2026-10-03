import { useState } from 'react';
import { motion } from 'framer-motion';
import { isLocalMode, supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, Loader2, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginWithLocal, setSession } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!isLocalMode && supabase) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          // Récupérer le profil Supabase
          const { data: profData } = await supabase
            .from('profiles')
            .select('*, company:companies(*)')
            .eq('id', authData.user.id)
            .single();

          if (profData) {
            setSession({ id: authData.user.id, email: authData.user.email }, profData);
          }
          navigate('/');
          return;
        }
      } else {
        // 2. Fallback mode local (si pas de Supabase configuré)
        const localRes = loginWithLocal(email, password);
        if (localRes.success) {
          navigate('/');
          return;
        }
        setError(localRes.error || 'Email ou mot de passe incorrect.');
      }
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 16px',
      background: '#000000',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#1c1c1e',
          borderRadius: 24,
          padding: '32px 24px',
          border: '0.5px solid rgba(84, 84, 88, 0.36)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: 18,
            background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.2), rgba(10, 132, 255, 0.05))',
            border: '1px solid rgba(10, 132, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(10, 132, 255, 0.25)',
          }}>
            <ShieldCheck style={{ width: 32, height: 32, color: '#0a84ff', strokeWidth: 2 }} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
            Connexion VTC Pro
          </h1>
          <p style={{ fontSize: 13, color: '#8e8e93', marginTop: 6 }}>
            Accédez à votre espace de gestion et facturation
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255, 69, 58, 0.12)',
            border: '0.5px solid rgba(255, 69, 58, 0.3)',
            color: '#ff453a',
            padding: '12px 14px',
            borderRadius: 14,
            fontSize: 13,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: 10,
              background: '#ff453a', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 12, flexShrink: 0,
            }}>!</div>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: '#2c2c2e',
              border: '0.5px solid rgba(84, 84, 88, 0.36)',
              borderRadius: 14,
              padding: '0 16px',
            }}>
              <Mail style={{ width: 18, height: 18, color: '#8e8e93', flexShrink: 0 }} />
              <input
                required
                type="email"
                placeholder="Email de connexion"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: '14px 0',
                  color: '#fff',
                  fontSize: 15,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: '#2c2c2e',
              border: '0.5px solid rgba(84, 84, 88, 0.36)',
              borderRadius: 14,
              padding: '0 16px',
            }}>
              <Lock style={{ width: 18, height: 18, color: '#8e8e93', flexShrink: 0 }} />
              <input
                required
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: '14px 0',
                  color: '#fff',
                  fontSize: 15,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '14px',
              borderRadius: 14,
              background: '#0a84ff',
              color: '#ffffff',
              fontSize: 16,
              fontWeight: 700,
              boxShadow: '0 4px 16px rgba(10, 132, 255, 0.35)',
              marginTop: 6,
            }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Se connecter</span>
                <LogIn style={{ width: 18, height: 18 }} />
              </>
            )}
          </button>
          
          <div style={{ textAlign: 'right', marginTop: -4 }}>
            <Link to="/forgot-password" style={{ color: '#0a84ff', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>
              Mot de passe oublié ?
            </Link>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#8e8e93' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color: '#0a84ff', fontWeight: 600, textDecoration: 'none' }}>
            Inscrire ma société VTC
          </Link>
        </p>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 12, color: '#636366' }}>
          VTC Pro Console • Réalisé par <span style={{ color: '#8e8e93', fontWeight: 600 }}>David Chemla</span>
        </p>
      </motion.div>
    </div>
  );
}
