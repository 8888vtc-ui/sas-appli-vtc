import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;
      
      setSuccess(true);
      
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la demande de réinitialisation.');
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
        <button 
          onClick={() => navigate('/login')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8e8e93', fontSize: 13, background: 'none', border: 'none', padding: 0, marginBottom: 24, cursor: 'pointer' }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> Retour
        </button>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
            Mot de passe oublié ?
          </h1>
          <p style={{ fontSize: 13, color: '#8e8e93', marginTop: 6 }}>
            Entrez votre adresse email pour recevoir un lien de réinitialisation.
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
          <div style={{ textAlign: 'center', background: 'rgba(48, 209, 88, 0.1)', padding: '24px', borderRadius: 16, border: '1px solid rgba(48, 209, 88, 0.2)' }}>
            <CheckCircle2 style={{ width: 48, height: 48, color: '#30d158', margin: '0 auto 16px' }} />
            <p style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>Lien envoyé !</p>
            <p style={{ color: '#8e8e93', fontSize: 13, marginTop: 8 }}>Vérifiez votre boîte mail (et vos spams) pour réinitialiser votre mot de passe.</p>
          </div>
        ) : (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, background: '#2c2c2e',
              border: '0.5px solid rgba(84, 84, 88, 0.36)', borderRadius: 14, padding: '0 16px',
            }}>
              <Mail style={{ width: 18, height: 18, color: '#8e8e93', flexShrink: 0 }} />
              <input
                required
                type="email"
                placeholder="Votre adresse email"
                value={email}
                onChange={e => setEmail(e.target.value)}
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
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Envoyer le lien'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
