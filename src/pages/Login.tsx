import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      navigate('/');
    } catch (err: any) {
      setError('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleLocalDemo = () => {
    const demoProfile = {
      id: 'local-user',
      company_id: 'local-company',
      full_name: 'Chauffeur Démo',
      phone: '06 12 34 56 78',
      driver_card_number: 'VTC-123456',
      role: 'admin',
      company: {
        id: 'local-company',
        name: 'VTC Riviera Express',
        address: '10 Promenade des Anglais, 06000 Nice',
        phone: '04 93 00 00 00',
        email: 'contact@vtc-riviera.fr',
        siret: '12345678900012',
        siren: '123456789',
        registre_vtc: 'EVTC-006-12345',
        tva_regime: 'franchise',
        welcome_message: 'BIENVENUE',
        logo_color: '#3B82F6'
      }
    };
    localStorage.setItem('vtc_local_profile', JSON.stringify(demoProfile));
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0F172A]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="glass max-w-md w-full p-10 rounded-3xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">Connexion</h1>
          <p className="text-[#94A3B8]">Accédez à votre console VTC Pro</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-8 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 focus-within:border-blue-500/50 focus-within:bg-white/[0.08] transition-all group">
              <Mail className="w-5 h-5 text-[#64748b] group-focus-within:text-blue-400 transition-colors" />
              <input required type="email" placeholder="Email professionnel" value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 bg-transparent py-4 text-white text-sm outline-none placeholder:text-white/20" />
            </div>
            
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 focus-within:border-blue-500/50 focus-within:bg-white/[0.08] transition-all group">
              <Lock className="w-5 h-5 text-[#64748b] group-focus-within:text-blue-400 transition-colors" />
              <input required type="password" placeholder="Mot de passe" value={password}
                onChange={e => setPassword(e.target.value)}
                className="flex-1 bg-transparent py-4 text-white text-sm outline-none placeholder:text-white/20" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary justify-center py-4 text-base font-bold shadow-xl shadow-blue-600/20 active:scale-[0.98]">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Se connecter <LogIn className="w-5 h-5 ml-2" /></>}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
          <span className="relative bg-[#0F172A] px-3 text-xs text-[#64748b] uppercase font-bold tracking-wider">ou</span>
        </div>

        <button type="button" onClick={handleLocalDemo} className="w-full py-3.5 px-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2">
          🚀 Accéder en Mode Démo (Local)
        </button>

        <p className="text-center mt-8 text-sm text-[#94A3B8]">
          Pas encore de compte ? <Link to="/register" className="text-blue-400 font-bold hover:underline">Inscrire ma société</Link>
        </p>
      </motion.div>
    </div>
  );
}
