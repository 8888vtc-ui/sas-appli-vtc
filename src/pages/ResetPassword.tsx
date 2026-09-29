import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si on est bien arrivé via un lien de réinitialisation
    supabase?.auth.getSession().then(({ data: { session } }: any) => {
      if (!session) {
        setError("Lien invalide ou expiré. Veuillez refaire une demande de réinitialisation.");
      }
    });
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    
    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du mot de passe.');
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
            width: 60, height: 60, borderRadius: 18,
            background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.2), rgba(10, 132, 255, 0.05))',
            border: '1px solid rgba(10, 132, 255, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Lock style={{ width: 32, height: 32, color: '#0a84ff', strokeWidth: 2 }} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
            Nouveau mot de passe
          </h1>
          <p style={{ fontSize: 13, color: '#8e8e93', marginTop: 6 }}>
            Choisissez un nouveau mot de passe sécurisé.
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255, 69, 58, 0.12)', border: '0.5px solid rgba(255, 69, 58, 0.3)',
            color: '#ff453a', padding: '12px 14px', borderRadius: 14, fontSize: 13,
            marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 style={{ width: 48, height: 48, color: '#30d158', margin: '0 auto 16px' }} />
            <p style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>Mot de passe mis à jour !</p>
            <p style={{ color: '#8e8e93', fontSize: 13, marginTop: 8 }}>Redirection vers la connexion...</p>
          </div>
        ) : (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, background: '#2c2c2e',
              border: '0.5px solid rgba(84, 84, 88, 0.36)', borderRadius: 14, padding: '0 16px',
            }}>
              <Lock style={{ width: 18, height: 18, color: '#8e8e93', flexShrink: 0 }} />
              <input
                required
                type="password"
                placeholder="Nouveau mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', background: 'transparent', border: 'none', padding: '14px 0', color: '#fff', fontSize: 15, outline: 'none' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: 14, background: '#0a84ff',
                color: '#ffffff', fontSize: 16, fontWeight: 700, marginTop: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enregistrer'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
