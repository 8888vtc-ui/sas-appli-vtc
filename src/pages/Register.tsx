import { useState } from 'react';
import { motion } from 'framer-motion';
import { isLocalMode, supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { registerLocalAccount } from '../lib/authService';
import {
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Hash,
  MapPin,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const { setSession } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    driverCardNumber: '',
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
    setSuccessMsg(null);

    // Validation minimale
    if (formData.password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      setLoading(false);
      return;
    }

    try {
      if (!isLocalMode && supabase) {
        // --- 1. CLOUD MODE (Supabase) ---
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (authError) {
          throw new Error(authError.message);
        }

        if (authData.user) {
          const { data: compData, error: compErr } = await supabase
            .from('companies')
            .insert([{
              name: formData.companyName,
              registre_vtc: formData.registreVTC,
              siret: formData.siret,
              address: formData.address,
              tva_regime: formData.tvaRegime,
              email: formData.email,
              phone: formData.phone,
            }])
            .select()
            .single();

          if (compErr) throw new Error("Erreur société: " + compErr.message);

          if (compData) {
            const { error: profErr } = await supabase.from('profiles').insert([{
              id: authData.user.id,
              company_id: compData.id,
              full_name: formData.fullName,
              phone: formData.phone,
              driver_card_number: formData.driverCardNumber,
              role: 'admin',
            }]);

            if (profErr) throw new Error("Erreur profil: " + profErr.message);

            setSession(
              { id: authData.user.id, email: authData.user.email },
              { 
                id: authData.user.id, 
                company_id: compData.id, 
                role: 'admin', 
                company: compData,
                full_name: formData.fullName,
                phone: formData.phone,
                driver_card_number: formData.driverCardNumber
              }
            );
          }
        }
      } else {
        // --- 2. LOCAL MODE (Fallback if no Supabase) ---
        const localResult = registerLocalAccount({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone,
          companyName: formData.companyName,
          registreVTC: formData.registreVTC,
          siret: formData.siret,
          address: formData.address,
          tvaRegime: formData.tvaRegime,
          driverCardNumber: formData.driverCardNumber,
        });

        if (!localResult.success || !localResult.user || !localResult.profile) {
          throw new Error(localResult.error || 'Erreur lors de la création du compte local.');
        }

        setSession(localResult.user, localResult.profile);
      }

      setSuccessMsg('Compte créé avec succès ! Initialisation de votre espace...');

      setTimeout(() => {
        navigate('/');
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la création du compte.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#0F172A]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass max-w-2xl w-full p-6 md:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-400 shadow-lg shadow-blue-500/10">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Inscription Entreprise VTC</h1>
          <p className="text-[#94A3B8] text-sm mt-2">
            Créez votre société et votre compte administrateur conforme réglementation 2025
          </p>
          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            {isLocalMode ? 'Mode Autonome Sécurisé (Navigateur / Prêt à l\'emploi)' : 'Mode Cloud Synchronisé'}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold text-xs shrink-0 mt-0.5">!</div>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm mb-6 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-8">
          {/* Section Entreprise */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <Building2 className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">1. Informations de la Société</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-4 bg-slate-800 border border-slate-600 rounded-xl px-4 h-14 focus-within:ring-2 focus-within:ring-blue-500 focus-within:outline-none transition-all group">
                <Building2 className="w-5 h-5 text-[#64748b] group-focus-within:text-blue-400 transition-colors" />
                <input
                  required
                  type="text"
                  placeholder="Nom de la Société (ex: SAS AZUR TRANSPORTS)"
                  value={formData.companyName}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  className="flex-1 bg-transparent h-full text-white text-base outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-4 bg-slate-800 border border-slate-600 rounded-xl px-4 h-14 focus-within:ring-2 focus-within:ring-blue-500 focus-within:outline-none transition-all group">
                  <ShieldCheck className="w-5 h-5 text-[#64748b] group-focus-within:text-blue-400 transition-colors" />
                  <input
                    required
                    type="text"
                    placeholder="N° Registre EVTC (ex: EVTC060...)"
                    value={formData.registreVTC}
                    onChange={e => setFormData({ ...formData, registreVTC: e.target.value })}
                    className="flex-1 bg-transparent h-full text-white text-base outline-none placeholder:text-slate-400"
                  />
                </div>
                <div className="flex items-center gap-4 bg-slate-800 border border-slate-600 rounded-xl px-4 h-14 focus-within:ring-2 focus-within:ring-blue-500 focus-within:outline-none transition-all group">
                  <Hash className="w-5 h-5 text-[#64748b] group-focus-within:text-blue-400 transition-colors" />
                  <input
                    required
                    type="text"
                    placeholder="SIRET (14 chiffres)"
                    value={formData.siret}
                    onChange={e => setFormData({ ...formData, siret: e.target.value })}
                    className="flex-1 bg-transparent h-full text-white text-base outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 bg-slate-800 border border-slate-600 rounded-xl px-4 h-14 focus-within:ring-2 focus-within:ring-blue-500 focus-within:outline-none transition-all group">
                <MapPin className="w-5 h-5 text-[#64748b] group-focus-within:text-blue-400 transition-colors" />
                <input
                  required
                  type="text"
                  placeholder="Adresse complète du siège social"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="flex-1 bg-transparent h-full text-white text-base outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tvaRegime: 'franchise' })}
                  className={`flex-1 py-3 px-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    formData.tvaRegime === 'franchise' ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white'
                  }`}
                >
                  Franchise TVA (Art. 293 B CGI)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, tvaRegime: 'assujetti' })}
                  className={`flex-1 py-3 px-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    formData.tvaRegime === 'assujetti' ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white'
                  }`}
                >
                  Assujetti TVA (10% VTC)
                </button>
              </div>
            </div>
          </div>

          {/* Section Chauffeur / Administrateur */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <User className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">2. Chauffeur Administrateur / Gérant</h3>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-4 bg-slate-800 border border-slate-600 rounded-xl px-4 h-14 focus-within:ring-2 focus-within:ring-blue-500 focus-within:outline-none transition-all group">
                  <User className="w-5 h-5 text-[#64748b] group-focus-within:text-blue-400 transition-colors" />
                  <input
                    required
                    type="text"
                    placeholder="Nom complet (Prénom Nom)"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="flex-1 bg-transparent h-full text-white text-base outline-none placeholder:text-slate-400"
                  />
                </div>
                <div className="flex items-center gap-4 bg-slate-800 border border-slate-600 rounded-xl px-4 h-14 focus-within:ring-2 focus-within:ring-blue-500 focus-within:outline-none transition-all group">
                  <Phone className="w-5 h-5 text-[#64748b] group-focus-within:text-blue-400 transition-colors" />
                  <input
                    required
                    type="tel"
                    placeholder="Téléphone mobile"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="flex-1 bg-transparent h-full text-white text-base outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 bg-slate-800 border border-slate-600 rounded-xl px-4 h-14 focus-within:ring-2 focus-within:ring-blue-500 focus-within:outline-none transition-all group">
                <CreditCard className="w-5 h-5 text-[#64748b] group-focus-within:text-blue-400 transition-colors" />
                <input
                  required
                  type="text"
                  placeholder="N° Carte Professionnelle VTC (ex: T-060-XXXXXXXX)"
                  value={formData.driverCardNumber}
                  onChange={e => setFormData({ ...formData, driverCardNumber: e.target.value })}
                  className="flex-1 bg-transparent h-full text-white text-base outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center gap-4 bg-slate-800 border border-slate-600 rounded-xl px-4 h-14 focus-within:ring-2 focus-within:ring-blue-500 focus-within:outline-none transition-all group">
                <Mail className="w-5 h-5 text-[#64748b] group-focus-within:text-blue-400 transition-colors" />
                <input
                  required
                  type="email"
                  placeholder="Email de connexion (ex: contact@maboite.fr)"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="flex-1 bg-transparent h-full text-white text-base outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center gap-4 bg-slate-800 border border-slate-600 rounded-xl px-4 h-14 focus-within:ring-2 focus-within:ring-blue-500 focus-within:outline-none transition-all group">
                <Lock className="w-5 h-5 text-[#64748b] group-focus-within:text-blue-400 transition-colors" />
                <input
                  required
                  type="password"
                  placeholder="Mot de passe (minimum 6 caractères)"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="flex-1 bg-transparent h-full text-white text-base outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary justify-center py-4 text-base font-bold shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 active:scale-[0.98] transition-all"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Créer mon espace VTC <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[#94A3B8]">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-blue-400 font-bold hover:underline">
            Se connecter
          </Link>
        </div>

        <p className="text-center mt-6 text-xs text-[#64748b]">
          VTC Pro Console • Réalisé par <span className="text-slate-300 font-semibold">David Chemla</span>
        </p>
      </motion.div>
    </div>
  );
}
