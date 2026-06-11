import { useState } from 'react';
import { motion } from 'framer-motion';
import { isLocalMode, supabase } from '../lib/supabase';
import { Building2, User, Mail, Lock, Phone, ShieldCheck, ArrowRight, Loader2, Hash, MapPin } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    companyName: '',
    registreVTC: '',
    siret: '',
    address: '',
    tvaRegime: 'franchise' as 'franchise' | 'assujetti',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLocalMode) {
        // Mode Local : On simule l'enregistrement dans LocalStorage
        const mockCompany = {
          id: 'local-company',
          name: formData.companyName,
          registre_vtc: formData.registreVTC,
          siret: formData.siret,
          address: formData.address,
          tva_regime: formData.tvaRegime,
          email: formData.email,
        };
        const mockProfile = {
          id: 'local-user',
          company_id: 'local-company',
          full_name: formData.fullName,
          phone: formData.phone,
          role: 'admin' as const,
          company: mockCompany
        };

        localStorage.setItem('vtc_local_profile', JSON.stringify(mockProfile));
        localStorage.setItem('vtc_local_trips', JSON.stringify([]));
        localStorage.setItem('vtc_local_expenses', JSON.stringify([]));
        
        // Simulez une redirection propre
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
        return;
      }

      // Mode Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Erreur lors de la création de l\'utilisateur');

      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert([{
          name: formData.companyName,
          registre_vtc: formData.registreVTC,
          siret: formData.siret,
          address: formData.address,
          tva_regime: formData.tvaRegime,
          email: formData.email,
        }])
        .select()
        .single();

      if (companyError) throw companyError;

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          company_id: companyData.id,
          full_name: formData.fullName,
          phone: formData.phone,
          role: 'admin',
        }]);

      if (profileError) throw profileError;
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      if (!isLocalMode) setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0F172A]">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass max-w-xl w-full p-8 rounded-3xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Inscription Pro</h1>
          <p className="text-[#94A3B8] mt-2">Créez votre espace de gestion VTC {isLocalMode && '(Mode Local)'}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-8">
          {/* Section Entreprise */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Informations Société</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 focus-within:border-blue-500/50 transition-all group">
                <Building2 className="w-5 h-5 text-[#64748b] group-focus-within:text-blue-400" />
                <input required type="text" placeholder="Nom de la Société" value={formData.companyName}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  className="flex-1 bg-transparent py-4 text-white text-sm outline-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 focus-within:border-blue-500/50 transition-all group">
                  <ShieldCheck className="w-5 h-5 text-[#64748b] group-focus-within:text-blue-400" />
                  <input required type="text" placeholder="Registre VTC" value={formData.registreVTC}
                    onChange={e => setFormData({ ...formData, registreVTC: e.target.value })}
                    className="flex-1 bg-transparent py-4 text-white text-sm outline-none" />
                </div>
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 focus-within:border-blue-500/50 transition-all group">
                  <Hash className="w-5 h-5 text-[#64748b] group-focus-within:text-blue-400" />
                  <input required type="text" placeholder="SIRET" value={formData.siret}
                    onChange={e => setFormData({ ...formData, siret: e.target.value })}
                    className="flex-1 bg-transparent py-4 text-white text-sm outline-none" />
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 focus-within:border-blue-500/50 transition-all group">
                <MapPin className="w-5 h-5 text-[#64748b] group-focus-within:text-blue-400" />
                <input required type="text" placeholder="Adresse du siège social" value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="flex-1 bg-transparent py-4 text-white text-sm outline-none" />
              </div>

              <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <button type="button" onClick={() => setFormData({...formData, tvaRegime: 'franchise'})}
                  className={`flex-1 py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${formData.tvaRegime === 'franchise' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                  Franchise TVA
                </button>
                <button type="button" onClick={() => setFormData({...formData, tvaRegime: 'assujetti'})}
                  className={`flex-1 py-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${formData.tvaRegime === 'assujetti' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                  Assujetti TVA
                </button>
              </div>
            </div>
          </div>

          {/* Section Admin */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Compte Administrateur</h3>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 focus-within:border-blue-500/50 transition-all group">
                  <User className="w-5 h-5 text-[#64748b] group-focus-within:text-blue-400" />
                  <input required type="text" placeholder="Nom complet" value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="flex-1 bg-transparent py-4 text-white text-sm outline-none" />
                </div>
                <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 focus-within:border-blue-500/50 transition-all group">
                  <Phone className="w-5 h-5 text-[#64748b] group-focus-within:text-blue-400" />
                  <input required type="tel" placeholder="Téléphone" value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="flex-1 bg-transparent py-4 text-white text-sm outline-none" />
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 focus-within:border-blue-500/50 transition-all group">
                <Mail className="w-5 h-5 text-[#64748b] group-focus-within:text-blue-400" />
                <input required type="email" placeholder="Email professionnel" value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="flex-1 bg-transparent py-4 text-white text-sm outline-none" />
              </div>

              <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 focus-within:border-blue-500/50 transition-all group">
                <Lock className="w-5 h-5 text-[#64748b] group-focus-within:text-blue-400" />
                <input required type="password" placeholder="Mot de passe" value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="flex-1 bg-transparent py-4 text-white text-sm outline-none" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary justify-center py-4 text-base font-bold shadow-xl shadow-blue-900/20">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Créer mon espace <ArrowRight className="w-5 h-5 ml-2" /></>}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-[#94A3B8]">
          Déjà inscrit ? <Link to="/login" className="text-blue-400 font-bold hover:underline">Se connecter</Link>
        </p>
      </motion.div>
    </div>
  );
}
