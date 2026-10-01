import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  User,
  Car,
  Eye,
  Download,
  Upload,
  Database,
  Users,
  UserPlus,
  Trash2,
  CheckCircle2,
  X,
  Bot,
  CreditCard,
  Phone,
  Mail,
  Sparkles,
  Save,
  Loader2,
} from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { AppSettings, CompanyDriver } from '../types';
import { exportFullBackupJSON, importFullBackupJSON } from '../lib/exportUtils';
import {
  getCompanyDrivers,
  addCompanyDriver,
  deleteCompanyDriver,
} from '../lib/authService';

import { showToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { settings, updateSettings } = useApp();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await updateSettings(localSettings);
    setIsSaving(false);
    showToast('Paramètres enregistrés avec succès', 'success');
  };

  const [drivers, setDrivers] = useState<CompanyDriver[]>(() => getCompanyDrivers());
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<string | null>(null);
  const [newDriver, setNewDriver] = useState({
    fullName: '',
    phone: '',
    email: '',
    driverCardNumber: '',
    role: 'driver' as 'admin' | 'driver',
    status: 'active' as const,
  });

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.fullName.trim()) return;

    const added = addCompanyDriver(newDriver);
    setDrivers([...drivers, added]);
    setIsDriverModalOpen(false);
    showToast(`Chauffeur ${newDriver.fullName} ajouté avec succès`, 'success');
    setNewDriver({
      fullName: '',
      phone: '',
      email: '',
      driverCardNumber: '',
      role: 'driver',
      status: 'active',
    });
  };

  const confirmDeleteDriver = (id: string) => {
    deleteCompanyDriver(id);
    setDrivers(drivers.filter(d => d.id !== id));
    setDriverToDelete(null);
    showToast('Chauffeur retiré avec succès', 'info');
  };

  const handleSetPrimaryDriver = (d: CompanyDriver) => {
    setLocalSettings({
      ...localSettings,
      driverName: d.fullName,
      driverPhone: d.phone || '',
      driverCardNumber: d.driverCardNumber || '',
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Entreprise */}
      <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-8">
        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-400" /> Entreprise
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          {([
            ['Nom Entreprise', 'companyName', 'text', 'SAS MON VTC'],
            ['Adresse', 'companyAddress', 'text', '123 Avenue de la Croisette, 06400 Cannes'],
            ['Téléphone', 'companyPhone', 'tel', '+33 6 00 00 00 00'],
            ['Email', 'companyEmail', 'email', 'contact@monvtc.fr'],
            ['SIRET', 'siret', 'text', '123 456 789 00018'],
            ['SIREN', 'siren', 'text', '123 456 789'],
            ['N° Registre VTC', 'registreVTC', 'text', 'EVTC060XXXXXX'],
          ] as const).map(([label, key, type, ph]) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>{label}</label>
              <input
                type={type}
                placeholder={ph}
                value={localSettings[key as keyof AppSettings] as string}
                onChange={e => setLocalSettings({ ...localSettings, [key]: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white text-sm placeholder-white/20 focus:border-blue-500/50 transition-all"
              />
            </div>
          ))}
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>Régime TVA</label>
            <select
              value={localSettings.tvaRegime}
              onChange={e => setLocalSettings({ ...localSettings, tvaRegime: e.target.value as 'franchise' | 'assujetti' })}
              className="w-full bg-[#1e293b] border border-white/10 rounded-xl p-3 outline-none text-white text-sm"
            >
              <option value="franchise">Franchise en base (art. 293 B CGI - 0%)</option>
              <option value="assujetti">Assujetti à la TVA</option>
            </select>
          </div>
          {localSettings.tvaRegime === 'assujetti' && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>Taux de TVA applicable</label>
                <select
                  value={localSettings.tvaRate ?? 10}
                  onChange={e => setLocalSettings({ ...localSettings, tvaRate: Number(e.target.value) })}
                  className="w-full bg-[#1e293b] border border-white/10 rounded-xl p-3 outline-none text-white text-sm"
                >
                  <option value={10}>10% — Transport de personnes VTC (Taux légal art. 279 b quater CGI)</option>
                  <option value={20}>20% — Prestations annexes / Conciergerie (Taux normal)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>N° TVA Intracom</label>
                <input
                  type="text"
                  placeholder="FRXX999999999"
                  value={localSettings.tvaNumber}
                  onChange={e => setLocalSettings({ ...localSettings, tvaNumber: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white text-sm"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Équipe & Chauffeurs (Gestion Multi-Utilisateurs) */}
      <div className="glass rounded-3xl p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> Chauffeurs & Équipe ({drivers.length})
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Gérez les chauffeurs et utilisateurs autorisés à réaliser les prestations pour votre société
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDriverModalOpen(true)}
            className="btn-primary py-2.5 px-4 text-xs font-bold shrink-0 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" /> Ajouter un Chauffeur
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          {drivers.map(d => {
            const isPrimary = localSettings.driverName === d.fullName;
            return (
              <div
                key={d.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isPrimary
                    ? 'bg-blue-600/10 border-blue-500/40'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                        {d.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm flex items-center gap-2">
                          {d.fullName}
                          {isPrimary && (
                            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-semibold border border-blue-500/30">
                              Principal
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 capitalize">
                          {d.role === 'admin' ? 'Administrateur / Gérant' : 'Chauffeur VTC'}
                        </div>
                      </div>
                    </div>

                    {drivers.length > 1 && !isPrimary && (
                      driverToDelete === d.id ? (
                        <div className="flex items-center gap-1.5 bg-red-500/20 p-1 rounded-xl border border-red-500/30">
                          <span className="text-[10px] text-red-300 font-bold pl-1">Sûr ?</span>
                          <button
                            type="button"
                            onClick={() => confirmDeleteDriver(d.id)}
                            className="px-2 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[11px] font-bold"
                          >
                            Oui
                          </button>
                          <button
                            type="button"
                            onClick={() => setDriverToDelete(null)}
                            className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px]"
                          >
                            Non
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDriverToDelete(d.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Retirer le chauffeur"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </div>

                  <div className="space-y-1 mt-3 text-xs text-slate-300">
                    {d.driverCardNumber && (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono text-[11px]">{d.driverCardNumber}</span>
                      </div>
                    )}
                    {d.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{d.phone}</span>
                      </div>
                    )}
                    {d.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-400">{d.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {!isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimaryDriver(d)}
                    className="mt-4 w-full py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-all border border-white/5 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Définir par défaut sur les bons
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Ajout Chauffeur */}
      <AnimatePresence>
        {isDriverModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass max-w-lg w-full p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-white font-bold text-lg">
                  <UserPlus className="w-5 h-5 text-blue-400" /> Nouveau Chauffeur / Utilisateur
                </div>
                <button
                  type="button"
                  onClick={() => setIsDriverModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddDriver} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">Nom complet *</label>
                  <input
                    required
                    type="text"
                    placeholder="Prénom Nom"
                    value={newDriver.fullName}
                    onChange={e => setNewDriver({ ...newDriver, fullName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">Téléphone</label>
                    <input
                      type="tel"
                      placeholder="+33 6 XX XX XX XX"
                      value={newDriver.phone}
                      onChange={e => setNewDriver({ ...newDriver, phone: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">Rôle</label>
                    <select
                      value={newDriver.role}
                      onChange={e => setNewDriver({ ...newDriver, role: e.target.value as any })}
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl p-3 outline-none text-white text-sm"
                    >
                      <option value="driver">Chauffeur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">N° Carte Professionnelle VTC</label>
                  <input
                    type="text"
                    placeholder="T-060-XXXX-XX-XXXXX-X"
                    value={newDriver.driverCardNumber}
                    onChange={e => setNewDriver({ ...newDriver, driverCardNumber: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">Email professionnel</label>
                  <input
                    type="email"
                    placeholder="chauffeur@entreprise.fr"
                    value={newDriver.email}
                    onChange={e => setNewDriver({ ...newDriver, email: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsDriverModalOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white font-semibold text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary justify-center py-3 text-sm font-bold shadow-lg shadow-blue-600/30"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chauffeur Actif par Défaut */}
      <div className="glass rounded-3xl p-8">
        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
          <User className="w-5 h-5 text-blue-400" /> Chauffeur Actif sur les Documents
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          {([
            ['Nom complet', 'driverName', 'text', 'Jean Dupont'],
            ['N° Carte Pro VTC', 'driverCardNumber', 'text', 'T-060-XXXX-XX-XXXXX-X'],
            ['Téléphone', 'driverPhone', 'tel', '+33 6 XX XX XX XX'],
          ] as const).map(([label, key, type, ph]) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>{label}</label>
              <input
                type={type}
                placeholder={ph}
                value={localSettings[key as keyof AppSettings] as string}
                onChange={e => setLocalSettings({ ...localSettings, [key]: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white text-sm placeholder-white/20 focus:border-blue-500/50 transition-all"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Véhicule */}
      <div className="glass rounded-3xl p-8">
        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
          <Car className="w-5 h-5 text-blue-400" /> Véhicule
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          {([
            ['Modèle', 'vehicleModel', 'text', 'Tesla Model S'],
            ['Immatriculation', 'vehiclePlate', 'text', 'AB-123-CD'],
          ] as const).map(([label, key, type, ph]) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>{label}</label>
              <input
                type={type}
                placeholder={ph}
                value={localSettings[key as keyof AppSettings] as string}
                onChange={e => setLocalSettings({ ...localSettings, [key]: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white text-sm placeholder-white/20 focus:border-blue-500/50 transition-all"
              />
            </div>
          ))}
          
          <div className="space-y-2 sm:col-span-2 mt-2">
            <h3 className="text-sm font-bold text-white mb-2">Comptabilité & Régime du Véhicule</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${localSettings.vehicleOwnership === 'company' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5'}`}>
                <input type="radio" name="vehicleOwnership" value="company" checked={localSettings.vehicleOwnership === 'company'} onChange={() => setLocalSettings({ ...localSettings, vehicleOwnership: 'company' })} className="hidden" />
                <div className="font-bold text-white text-sm mb-1">Société / LLD / LOA</div>
                <div className="text-xs text-slate-400">Déduction aux frais réels (Carburant, Péage, Entretien...).</div>
              </label>
              <label className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${localSettings.vehicleOwnership === 'personal' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5'}`}>
                <input type="radio" name="vehicleOwnership" value="personal" checked={localSettings.vehicleOwnership === 'personal'} onChange={() => setLocalSettings({ ...localSettings, vehicleOwnership: 'personal' })} className="hidden" />
                <div className="font-bold text-white text-sm mb-1">Véhicule Personnel</div>
                <div className="text-xs text-slate-400">Barème Kilométrique URSSAF.</div>
              </label>
            </div>
          </div>
          
          {localSettings.vehicleOwnership === 'personal' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>Puissance Fiscale (Barème URSSAF)</label>
              <select
                value={localSettings.fiscalPower || '5cv'}
                onChange={e => setLocalSettings({ ...localSettings, fiscalPower: e.target.value as any })}
                className="w-full bg-[#1e293b] border border-white/10 rounded-xl p-3 outline-none text-white text-sm"
              >
                <option value="3cv">3 CV Fiscaux</option>
                <option value="4cv">4 CV Fiscaux</option>
                <option value="5cv">5 CV Fiscaux</option>
                <option value="6cv">6 CV Fiscaux</option>
                <option value="7cv+">7 CV Fiscaux ou plus</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Sign Mode Settings */}
      <div className="glass rounded-3xl p-8">
        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-400" /> Accueil Aéroport
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>Message d'accueil</label>
            <input
              type="text"
              placeholder="BIENVENUE"
              value={localSettings.welcomeMessage}
              onChange={e => setLocalSettings({ ...localSettings, welcomeMessage: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>Couleur logo</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={localSettings.logoColor}
                onChange={e => setLocalSettings({ ...localSettings, logoColor: e.target.value })}
                className="w-12 h-12 rounded-xl border border-white/10 bg-transparent cursor-pointer"
              />
              <span className="text-sm text-white font-mono">{localSettings.logoColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plan & Modes (Basic vs AI) */}
      <div className="glass rounded-3xl p-8 relative overflow-hidden">
        {localSettings.appMode === 'ai' && (
          <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        )}
        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" /> Plan & Expérience de l'Application
        </h2>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setLocalSettings({ ...localSettings, appMode: 'basic' })}
            className={`p-5 rounded-2xl border-2 text-left transition-all ${
              localSettings.appMode === 'basic'
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <h3 className={`font-bold text-lg mb-2 ${localSettings.appMode === 'basic' ? 'text-blue-400' : 'text-white'}`}>
              Mode Standard (Basique)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              La gestion VTC classique : facturation, coffre-fort, comptabilité manuelle. Idéal pour démarrer sans IA.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setLocalSettings({ ...localSettings, appMode: 'ai' })}
            className={`p-5 rounded-2xl border-2 text-left transition-all ${
              localSettings.appMode === 'ai'
                ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className={`font-bold text-lg ${localSettings.appMode === 'ai' ? 'text-purple-400' : 'text-white'}`}>
                Mode IA Premium
              </h3>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-wider">
                Recommandé
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Débloque le Copilote IA, le scanner de reçus magique et le Radar WhatsApp Bourse aux courses.
            </p>
          </button>
        </div>
      </div>

      {/* AI Settings */}
      <div className="glass rounded-3xl p-8">
        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" /> Intelligence Artificielle (Choix Libre)
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>Fournisseur IA</label>
            <select
              value={localSettings.aiProvider || 'gemini'}
              onChange={e => setLocalSettings({ ...localSettings, aiProvider: e.target.value as any })}
              className="w-full bg-[#1e293b] border border-white/10 rounded-xl p-3 outline-none text-white text-sm"
            >
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI (ChatGPT)</option>
              <option value="anthropic">Anthropic (Claude)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>Clé API ({localSettings.aiProvider || 'gemini'})</label>
            <input
              type="password"
              placeholder="sk-..."
              value={localSettings.geminiApiKey || localSettings.geminiApiKey || ''}
              onChange={e => setLocalSettings({ ...localSettings, geminiApiKey: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white text-sm"
            />
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3">Nécessaire pour le Générateur de Prospects IA et les analyses intelligentes.</p>
      </div>

      {/* Backup & Restore */}
      <div className="glass rounded-3xl p-8">
        <h2 className="text-xl font-bold mb-2 text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" /> Sauvegarde & Restauration (JSON)
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Sauvegardez l'intégralité de vos courses, factures, contacts et paramètres dans un fichier JSON réutilisable.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={() => exportFullBackupJSON()}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
          >
            <Download className="w-4 h-4" /> Exporter la sauvegarde (JSON)
          </button>

          <label className="flex-1 py-3.5 px-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all">
            <Upload className="w-4 h-4" /> Importer une sauvegarde
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={async e => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    await importFullBackupJSON(file);
                    alert('Sauvegarde restaurée avec succès ! La page va se recharger.');
                    window.location.reload();
                  } catch {
                    alert("Erreur lors de l'import de la sauvegarde.");
                  }
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Creator Profile Link */}
      <div className="pt-8 pb-4 flex justify-center">
        <button
          type="button"
          onClick={() => navigate('/creator')}
          className="group flex flex-col items-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)] group-hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] border-2 border-[#1c1c1e]">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <span className="text-xs text-slate-500 block">Conçu et développé par</span>
            <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              David Chemla - Expert IA
            </span>
          </div>
        </button>
      </div>

      <div className="pt-6 border-t border-white/10 w-full px-4 sm:px-0">
        <button
          type="button"
          onClick={() => {
            if(window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
              signOut();
              navigate('/login');
            }
          }}
          className="w-full h-14 rounded-2xl bg-red-900/30 border border-red-800 text-red-400 font-bold text-lg hover:bg-red-900/50 transition-all flex items-center justify-center active:scale-95"
        >
          Se déconnecter
        </button>
      </div>

      {/* Floating Save Button */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 sm:bottom-8 left-0 right-0 z-40 flex justify-center px-4"
          >
            <div className="bg-[#1e293b]/90 backdrop-blur-md border border-white/10 p-3 sm:p-4 rounded-3xl shadow-2xl flex items-center gap-4 max-w-lg w-full">
              <div className="flex-1">
                <p className="text-white font-bold text-sm">Modifications non enregistrées</p>
                <p className="text-xs text-slate-400">N'oubliez pas de sauvegarder.</p>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="btn-primary py-2.5 px-6 font-bold flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>Enregistrer</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </motion.div>
  );
}
