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
  CreditCard,
  Phone,
  Mail,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { AppSettings, CompanyDriver } from '../types';
import { exportFullBackupJSON, importFullBackupJSON } from '../lib/exportUtils';
import {
  getCompanyDrivers,
  addCompanyDriver,
  deleteCompanyDriver,
} from '../lib/authService';

export default function Settings() {
  const { settings, updateSettings } = useApp();
  const [drivers, setDrivers] = useState<CompanyDriver[]>(() => getCompanyDrivers());
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
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
    setNewDriver({
      fullName: '',
      phone: '',
      email: '',
      driverCardNumber: '',
      role: 'driver',
      status: 'active',
    });
  };

  const handleDeleteDriver = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir retirer ce chauffeur / utilisateur ?')) {
      deleteCompanyDriver(id);
      setDrivers(drivers.filter(d => d.id !== id));
    }
  };

  const handleSetPrimaryDriver = (d: CompanyDriver) => {
    updateSettings({
      ...settings,
      driverName: d.fullName,
      driverPhone: d.phone,
      driverCardNumber: d.driverCardNumber,
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Entreprise */}
      <div className="glass rounded-3xl p-8">
        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-400" /> Entreprise
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
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
                value={settings[key as keyof AppSettings] as string}
                onChange={e => updateSettings({ ...settings, [key]: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white text-sm placeholder-white/20 focus:border-blue-500/50 transition-all"
              />
            </div>
          ))}
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>Régime TVA</label>
            <select
              value={settings.tvaRegime}
              onChange={e => updateSettings({ ...settings, tvaRegime: e.target.value as 'franchise' | 'assujetti' })}
              className="w-full bg-[#1e293b] border border-white/10 rounded-xl p-3 outline-none text-white text-sm"
            >
              <option value="franchise">Franchise en base (art. 293 B CGI - 0%)</option>
              <option value="assujetti">Assujetti à la TVA</option>
            </select>
          </div>
          {settings.tvaRegime === 'assujetti' && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>Taux de TVA applicable</label>
                <select
                  value={settings.tvaRate ?? 10}
                  onChange={e => updateSettings({ ...settings, tvaRate: Number(e.target.value) })}
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
                  value={settings.tvaNumber}
                  onChange={e => updateSettings({ ...settings, tvaNumber: e.target.value })}
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

        <div className="grid md:grid-cols-2 gap-4">
          {drivers.map(d => {
            const isPrimary = settings.driverName === d.fullName;
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
                      <button
                        type="button"
                        onClick={() => handleDeleteDriver(d.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Retirer le chauffeur"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
        <div className="grid md:grid-cols-2 gap-5">
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
                value={settings[key as keyof AppSettings] as string}
                onChange={e => updateSettings({ ...settings, [key]: e.target.value })}
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
        <div className="grid md:grid-cols-2 gap-5">
          {([
            ['Modèle', 'vehicleModel', 'text', 'Tesla Model S'],
            ['Immatriculation', 'vehiclePlate', 'text', 'AB-123-CD'],
          ] as const).map(([label, key, type, ph]) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>{label}</label>
              <input
                type={type}
                placeholder={ph}
                value={settings[key as keyof AppSettings] as string}
                onChange={e => updateSettings({ ...settings, [key]: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white text-sm placeholder-white/20 focus:border-blue-500/50 transition-all"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sign Mode Settings */}
      <div className="glass rounded-3xl p-8">
        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-400" /> Accueil Aéroport
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>Message d'accueil</label>
            <input
              type="text"
              placeholder="BIENVENUE"
              value={settings.welcomeMessage}
              onChange={e => updateSettings({ ...settings, welcomeMessage: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>Couleur logo</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.logoColor}
                onChange={e => updateSettings({ ...settings, logoColor: e.target.value })}
                className="w-12 h-12 rounded-xl border border-white/10 bg-transparent cursor-pointer"
              />
              <span className="text-sm text-white font-mono">{settings.logoColor}</span>
            </div>
          </div>
        </div>
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
    </motion.div>
  );
}
