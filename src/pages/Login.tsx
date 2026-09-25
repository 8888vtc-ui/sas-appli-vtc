import { useState } from 'react';
import { motion } from 'framer-motion';
import { isLocalMode, supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loginWithLocal, loginDemo, setSession } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. D'abord tester la connexion locale (comptes créés sur cette machine ou démo)
      const localRes = loginWithLocal(email, password);
      if (localRes.success) {
        navigate('/');
        return;
      }

      // 2. Si le mode Supabase est activé, tenter la connexion Supabase
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
      }

      // Si aucune méthode n'a validé les identifiants
      setError(localRes.error || 'Email ou mot de passe incorrect.');
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = () => {
    loginDemo();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#0F172A]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass max-w-md w-full p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-400 shadow-lg shadow-blue-500/10">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Connexion VTC Pro</h1>
          <p className="text-[#94A3B8] text-sm mt-2">Accédez à votre espace de gestion et facturation</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold text-xs shrink-0 mt-0.5">!</div>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 focus-within:border-blue-500/50 focus-within:bg-white/[0.08] transition-all group">
              <Mail className="w-5 h-5 text-[#64748b] group-focus-within:text-blue-400 transition-colors" />
              <input
                required
                type="email"
                placeholder="Email de connexion"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 bg-transparent py-3.5 text-white text-sm outline-none placeholder:text-white/20"
              />
            </div>

            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 focus-within:border-blue-500/50 focus-within:bg-white/[0.08] transition-all group">
              <Lock className="w-5 h-5 text-[#64748b] group-focus-within:text-blue-400 transition-colors" />
              <input
                required
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="flex-1 bg-transparent py-3.5 text-white text-sm outline-none placeholder:text-white/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary justify-center py-3.5 text-base font-bold shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 active:scale-[0.98] transition-all mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Se connecter <LogIn className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative bg-[#162032] px-3 text-xs text-[#64748b] uppercase font-bold tracking-wider rounded-md">
            ou tester directement
          </span>
        </div>

        <button
          type="button"
          onClick={handleDemoClick}
          className="w-full py-3.5 px-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 hover:border-white/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-400" /> Accéder en Mode Démo (1 Clic)
        </button>

        <p className="text-center mt-8 text-sm text-[#94A3B8]">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-blue-400 font-bold hover:underline">
            Inscrire ma société VTC
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
