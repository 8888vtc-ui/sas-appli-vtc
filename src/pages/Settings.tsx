import { motion } from 'framer-motion';
import { Building2, User, Car, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { AppSettings } from '../types';

export default function Settings() {
  const { settings, updateSettings } = useApp();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Entreprise */}
      <div className="glass rounded-3xl p-8">
        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2"><Building2 className="w-5 h-5" /> Entreprise</h2>
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
              <input type={type} placeholder={ph} value={settings[key as keyof AppSettings] as string}
                onChange={e => updateSettings({ ...settings, [key]: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white text-sm placeholder-white/20" />
            </div>
          ))}
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>Régime TVA</label>
            <select value={settings.tvaRegime}
              onChange={e => updateSettings({ ...settings, tvaRegime: e.target.value as 'franchise' | 'assujetti' })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white text-sm">
              <option value="franchise">Franchise (art. 293 B CGI)</option>
              <option value="assujetti">Assujetti TVA</option>
            </select>
          </div>
          {settings.tvaRegime === 'assujetti' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>N° TVA Intracom</label>
              <input type="text" value={settings.tvaNumber}
                onChange={e => updateSettings({ ...settings, tvaNumber: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white text-sm" />
            </div>
          )}
        </div>
      </div>

      {/* Chauffeur */}
      <div className="glass rounded-3xl p-8">
        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2"><User className="w-5 h-5" /> Chauffeur</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {([
            ['Nom complet', 'driverName', 'text', 'Jean Dupont'],
            ['N° Carte Pro VTC', 'driverCardNumber', 'text', 'T-060-XXXX-XX-XXXXX-X'],
            ['Téléphone', 'driverPhone', 'tel', '+33 6 XX XX XX XX'],
          ] as const).map(([label, key, type, ph]) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>{label}</label>
              <input type={type} placeholder={ph} value={settings[key as keyof AppSettings] as string}
                onChange={e => updateSettings({ ...settings, [key]: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white text-sm placeholder-white/20" />
            </div>
          ))}
        </div>
      </div>

      {/* Véhicule */}
      <div className="glass rounded-3xl p-8">
        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2"><Car className="w-5 h-5" /> Véhicule</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {([
            ['Modèle', 'vehicleModel', 'text', 'Tesla Model S'],
            ['Immatriculation', 'vehiclePlate', 'text', 'AB-123-CD'],
          ] as const).map(([label, key, type, ph]) => (
            <div key={key} className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>{label}</label>
              <input type={type} placeholder={ph} value={settings[key as keyof AppSettings] as string}
                onChange={e => updateSettings({ ...settings, [key]: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white text-sm placeholder-white/20" />
            </div>
          ))}
        </div>
      </div>

      {/* Sign Mode Settings */}
      <div className="glass rounded-3xl p-8">
        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2"><Eye className="w-5 h-5" /> Accueil Aéroport</h2>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>Message d'accueil</label>
            <input type="text" placeholder="BIENVENUE" value={settings.welcomeMessage}
              onChange={e => updateSettings({ ...settings, welcomeMessage: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none text-white text-sm" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium" style={{ color: '#94A3B8' }}>Couleur logo</label>
            <div className="flex items-center gap-3">
              <input type="color" value={settings.logoColor}
                onChange={e => updateSettings({ ...settings, logoColor: e.target.value })}
                className="w-12 h-12 rounded-xl border border-white/10 bg-transparent cursor-pointer" />
              <span className="text-sm text-white font-mono">{settings.logoColor}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
