import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Plus, Phone, Mail, MessageSquare, Star, Tag,
  Building2, Hotel, Briefcase, User, MapPin, Send,
  ChevronDown, UserPlus,
  X, CheckCircle2, AlertCircle, MessageCircle, Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format, differenceInDays } from 'date-fns';

// ─── TYPES ───
interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: 'client' | 'prospect';
  category: 'particulier' | 'hotel' | 'entreprise' | 'agence' | 'concierge' | 'restaurant';
  source: string;
  notes: string;
  lastContact: string;
  totalTrips: number;
  totalRevenue: number;
  rating: number;
  tags: string[];
  createdAt: string;
}

interface SMSTemplate {
  id: string;
  name: string;
  body: string;
  type: 'confirmation' | 'reminder' | 'promo' | 'followup' | 'thanks';
}

const SMS_TEMPLATES: SMSTemplate[] = [
  { id: '1', name: 'Confirmation de réservation', type: 'confirmation',
    body: 'Bonjour {nom}, votre VTC est confirmé le {date} à {heure}. Lieu: {lieu}. Votre chauffeur: {chauffeur}. {societe}' },
  { id: '2', name: 'Chauffeur en route', type: 'reminder',
    body: 'Bonjour {nom}, votre chauffeur {chauffeur} est en route vers {lieu}. Arrivée estimée dans 10 min. {societe}' },
  { id: '3', name: 'Remerciement post-course', type: 'thanks',
    body: 'Merci {nom} d\'avoir choisi {societe} ! Nous espérons que le trajet était agréable. Réservez à nouveau : {lien}' },
  { id: '4', name: 'Relance 30 jours', type: 'followup',
    body: 'Bonjour {nom}, cela fait un moment ! Profitez de -10% sur votre prochaine course avec le code VIP10. {societe}' },
  { id: '5', name: 'Offre entreprise', type: 'promo',
    body: 'Bonjour, {societe} propose des tarifs préférentiels pour vos déplacements professionnels. Contactez-nous : {tel}' },
];

const CATEGORIES = {
  particulier: { label: 'Particulier', icon: User, color: '#3b82f6' },
  hotel: { label: 'Hôtel / Concierge', icon: Hotel, color: '#8b5cf6' },
  entreprise: { label: 'Entreprise', icon: Briefcase, color: '#22c55e' },
  agence: { label: 'Agence de voyage', icon: MapPin, color: '#f59e0b' },
  concierge: { label: 'Concierge privé', icon: Star, color: '#ec4899' },
  restaurant: { label: 'Restaurant / Club', icon: Building2, color: '#ef4444' },
};

export default function CRM() {
  const { trips } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'clients' | 'prospects'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddContact, setShowAddContact] = useState(false);
  const [showSMSPanel, setShowSMSPanel] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [smsSent, setSMSSent] = useState(false);

  // Données contacts : localStorage
  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem('vtc_crm_contacts');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const saveContacts = (c: Contact[]) => {
    setContacts(c);
    localStorage.setItem('vtc_crm_contacts', JSON.stringify(c));
  };

  // Formulaire
  const [newContact, setNewContact] = useState({
    name: '', phone: '', email: '', category: 'particulier' as Contact['category'],
    type: 'prospect' as Contact['type'], source: '', notes: '', tags: ''
  });

  // Auto-enrichir depuis les courses passées
  const enrichedContacts = useMemo(() => {
    const contactMap = new Map<string, Contact>();
    
    // Ajouter les contacts manuels
    contacts.forEach(c => contactMap.set(c.phone || c.email || c.id, c));

    // Enrichir depuis les courses
    trips.forEach(trip => {
      const key = trip.clientPhone || trip.clientEmail || trip.clientName;
      if (!contactMap.has(key)) {
        contactMap.set(key, {
          id: key,
          name: trip.clientName,
          phone: trip.clientPhone || '',
          email: trip.clientEmail || '',
          type: 'client',
          category: 'particulier',
          source: 'Course',
          notes: '',
          lastContact: trip.date,
          totalTrips: 1,
          totalRevenue: trip.price,
          rating: 0,
          tags: [],
          createdAt: trip.date,
        });
      } else {
        const existing = contactMap.get(key)!;
        existing.totalTrips += 1;
        existing.totalRevenue += trip.price;
        existing.type = 'client';
        if (trip.date > existing.lastContact) existing.lastContact = trip.date;
      }
    });

    return Array.from(contactMap.values());
  }, [contacts, trips]);

  // Filtres
  const filtered = enrichedContacts
    .filter(c => activeTab === 'all' || c.type === (activeTab === 'clients' ? 'client' : 'prospect'))
    .filter(c => categoryFilter === 'all' || c.category === categoryFilter)
    .filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (b.lastContact || '').localeCompare(a.lastContact || ''));

  // Stats
  const stats = useMemo(() => ({
    total: enrichedContacts.length,
    clients: enrichedContacts.filter(c => c.type === 'client').length,
    prospects: enrichedContacts.filter(c => c.type === 'prospect').length,
    inactive30: enrichedContacts.filter(c => c.lastContact && differenceInDays(new Date(), new Date(c.lastContact)) > 30).length,
  }), [enrichedContacts]);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    const contact: Contact = {
      id: crypto.randomUUID(),
      name: newContact.name, phone: newContact.phone, email: newContact.email,
      type: newContact.type, category: newContact.category,
      source: newContact.source, notes: newContact.notes,
      lastContact: '', totalTrips: 0, totalRevenue: 0, rating: 0,
      tags: newContact.tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    };
    saveContacts([contact, ...contacts]);
    setNewContact({ name: '', phone: '', email: '', category: 'particulier', type: 'prospect', source: '', notes: '', tags: '' });
    setShowAddContact(false);
  };

  const deleteContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    saveContacts(updated);
  };

  const toggleSelect = (id: string) => {
    setSelectedContacts(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSendSMS = () => {
    // Simulation d'envoi
    setSMSSent(true);
    setTimeout(() => { setSMSSent(false); setShowSMSPanel(false); setSelectedContacts([]); }, 2000);
  };

  const getDaysColor = (days: number) => days > 60 ? '#ef4444' : days > 30 ? '#f59e0b' : '#22c55e';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {[
          { label: 'Contacts Total', value: stats.total, icon: Users, color: '#3b82f6' },
          { label: 'Clients Actifs', value: stats.clients, icon: CheckCircle2, color: '#22c55e' },
          { label: 'Prospects', value: stats.prospects, icon: UserPlus, color: '#8b5cf6' },
          { label: 'Inactifs > 30j', value: stats.inactive30, icon: AlertCircle, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl sm:rounded-2xl p-3 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] sm:text-xs font-medium text-slate-400">{s.label}</span>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="text-lg sm:text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Rechercher un contact, téléphone, email..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 outline-none text-sm text-white placeholder-white/30" />
        </div>

        <div className="flex gap-2 sm:gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {/* Tabs */}
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 shrink-0">
          {(['all', 'clients', 'prospects'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>
              {tab === 'all' ? 'Tous' : tab === 'clients' ? 'Clients' : 'Prospects'}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="relative">
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className="appearance-none bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-sm text-white cursor-pointer outline-none">
            <option value="all">Toutes catégories</option>
            {Object.entries(CATEGORIES).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-slate-500" />
        </div>

        <div className="flex gap-2">
          {selectedContacts.length > 0 && (
            <button onClick={() => setShowSMSPanel(true)}
              className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-bold flex items-center gap-2">
              <Send className="w-4 h-4" /> SMS ({selectedContacts.length})
            </button>
          )}
          <button onClick={() => setShowAddContact(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Ajouter
          </button>
          </div>
        </div>
      </div>

      {/* Contact List */}
      {filtered.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30 text-white" />
          <h3 className="text-xl font-bold text-white mb-2">Aucun contact</h3>
          <p className="text-slate-400 text-sm">Ajoutez vos premiers prospects ou créez des courses pour remplir votre base.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(contact => {
            const cat = CATEGORIES[contact.category];
            const daysSince = contact.lastContact ? differenceInDays(new Date(), new Date(contact.lastContact)) : null;
            const isSelected = selectedContacts.includes(contact.id);

            return (
              <motion.div key={contact.id} layout
                className={`glass rounded-2xl p-5 cursor-pointer transition-all ${isSelected ? 'border-blue-500/50 bg-blue-500/5' : 'hover:border-white/20'}`}
                onClick={() => toggleSelect(contact.id)}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-white/20'}`}>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>

                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${cat.color}20` }}>
                      <cat.icon className="w-5 h-5" style={{ color: cat.color }} />
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-white truncate">{contact.name}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: contact.type === 'client' ? 'rgba(34,197,94,0.15)' : 'rgba(139,92,246,0.15)',
                            color: contact.type === 'client' ? '#22c55e' : '#8b5cf6' }}>
                          {contact.type === 'client' ? 'Client' : 'Prospect'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${cat.color}15`, color: cat.color }}>
                          {cat.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                        {contact.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{contact.phone}</span>}
                        {contact.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{contact.email}</span>}
                        {contact.source && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{contact.source}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right stats & actions */}
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                    {contact.totalTrips > 0 && (
                      <div className="text-center min-w-[45px]">
                        <p className="text-base font-bold text-white">{contact.totalTrips}</p>
                        <p className="text-[10px] text-slate-500">courses</p>
                      </div>
                    )}
                    {contact.totalRevenue > 0 && (
                      <div className="text-center min-w-[55px]">
                        <p className="text-base font-bold text-emerald-400">{contact.totalRevenue.toFixed(0)}€</p>
                        <p className="text-[10px] text-slate-500">CA</p>
                      </div>
                    )}
                    {daysSince !== null && (
                      <div className="text-center min-w-[55px]">
                        <p className="text-base font-bold" style={{ color: getDaysColor(daysSince) }}>{daysSince}j</p>
                        <p className="text-[10px] text-slate-500">dernier contact</p>
                      </div>
                    )}

                    <div className="flex items-center gap-1 border-l border-white/10 pl-2 sm:pl-3 shrink-0">
                      {contact.phone && (
                        <>
                          <a href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-all" title="WhatsApp">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                          <a href={`tel:${contact.phone}`}
                            onClick={e => e.stopPropagation()}
                            className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all" title="Appeler">
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        </>
                      )}
                      {contact.email && (
                        <a href={`mailto:${contact.email}`}
                          onClick={e => e.stopPropagation()}
                          className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 transition-all" title="Email">
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button onClick={e => { e.stopPropagation(); deleteContact(contact.id); }}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all" title="Supprimer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ──── MODAL : Ajouter Contact ──── */}
      <AnimatePresence>
        {showAddContact && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="glass w-full max-w-lg rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Nouveau Contact</h3>
                <button onClick={() => setShowAddContact(false)} className="p-2 hover:bg-white/10 rounded-full text-white"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleAddContact} className="space-y-4">
                {/* Type */}
                <div className="flex gap-2">
                  {(['prospect', 'client'] as const).map(t => (
                    <button key={t} type="button" onClick={() => setNewContact({ ...newContact, type: t })}
                      className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${newContact.type === t ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500'}`}>
                      {t === 'prospect' ? '🎯 Prospect' : '✅ Client'}
                    </button>
                  ))}
                </div>

                <input required type="text" placeholder="Nom / Société" value={newContact.name}
                  onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none text-sm" />

                <div className="grid grid-cols-2 gap-3">
                  <input type="tel" placeholder="Téléphone" value={newContact.phone}
                    onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none text-sm" />
                  <input type="email" placeholder="Email" value={newContact.email}
                    onChange={e => setNewContact({ ...newContact, email: e.target.value })}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none text-sm" />
                </div>

                {/* Catégorie */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">Catégorie</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(CATEGORIES).map(([key, { label, icon: Icon, color }]) => (
                      <button key={key} type="button" onClick={() => setNewContact({ ...newContact, category: key as Contact['category'] })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${newContact.category === key ? 'border-2' : 'bg-white/5 border border-transparent text-slate-400'}`}
                        style={newContact.category === key ? { borderColor: color, color, background: `${color}10` } : {}}>
                        <Icon className="w-3.5 h-3.5" />{label}
                      </button>
                    ))}
                  </div>
                </div>

                <input type="text" placeholder="Source (ex: Google, bouche à oreille, LinkedIn...)" value={newContact.source}
                  onChange={e => setNewContact({ ...newContact, source: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none text-sm" />

                <input type="text" placeholder="Tags (séparés par virgule)" value={newContact.tags}
                  onChange={e => setNewContact({ ...newContact, tags: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none text-sm" />

                <textarea placeholder="Notes..." value={newContact.notes} rows={2}
                  onChange={e => setNewContact({ ...newContact, notes: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none text-sm resize-none" />

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddContact(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 font-medium">Annuler</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 font-bold">Enregistrer</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──── MODAL : Envoi SMS ──── */}
      <AnimatePresence>
        {showSMSPanel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="glass w-full max-w-lg rounded-3xl p-8">
              {smsSent ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">SMS envoyé(s) !</h3>
                  <p className="text-slate-400">{selectedContacts.length} message(s) dans la file d'attente</p>
                </div>
              ) : (<>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-green-400" /> Campagne SMS
                  </h3>
                  <button onClick={() => setShowSMSPanel(false)} className="p-2 hover:bg-white/10 rounded-full text-white"><X className="w-5 h-5" /></button>
                </div>

                <p className="text-sm text-slate-400 mb-4">{selectedContacts.length} destinataire(s) sélectionné(s)</p>

                <div className="space-y-3 mb-6">
                  <label className="block text-xs font-medium text-slate-400">Choisir un modèle</label>
                  {SMS_TEMPLATES.map(tpl => (
                    <button key={tpl.id} onClick={() => setSelectedTemplate(tpl.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${selectedTemplate === tpl.id ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                      <p className="text-sm font-bold text-white">{tpl.name}</p>
                      <p className="text-xs text-slate-400 mt-1">{tpl.body}</p>
                    </button>
                  ))}
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
                  <p className="text-xs text-yellow-400">
                    ⚠️ Pour activer l'envoi réel de SMS, configurez votre clé API Twilio ou OVH dans les Paramètres.
                    Coût estimé : ~{(selectedContacts.length * 0.07).toFixed(2)}€ ({selectedContacts.length} × 0,07€)
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowSMSPanel(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 font-medium">Annuler</button>
                  <button onClick={handleSendSMS} disabled={!selectedTemplate}
                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${selectedTemplate ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}>
                    <Send className="w-4 h-4" /> Envoyer
                  </button>
                </div>
              </>)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
