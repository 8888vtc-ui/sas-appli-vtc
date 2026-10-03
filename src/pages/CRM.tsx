import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Plus, MessageSquare, Send,
  ChevronDown, UserPlus,
  X, CheckCircle2, AlertCircle, Sparkles, Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format, differenceInDays } from 'date-fns';
import { generateProspects } from '../lib/aiProspects';
import { showToast } from '../components/Toast';
import ContactCard from '../components/crm/ContactCard';
import ConfirmDeleteModal from '../components/crm/ConfirmDeleteModal';
import OrderSlideOver from '../components/crm/OrderSlideOver';
import { CATEGORIES, contactKey, tripContactKey, type Contact } from '../components/crm/types';
import type { Trip } from '../types';

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

const tripTs = (t: Trip) => new Date(`${t.date}T${t.time || '00:00'}`).getTime();

export default function CRM() {
  const { trips, settings, invoices, invoiceTrip, downloadInvoice, generateBon } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'clients' | 'prospects'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [isGeneratingProspects, setIsGeneratingProspects] = useState(false);
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
    
    // Ajouter les contacts manuels (copie pour ne jamais muter l'état React)
    contacts.forEach(c => contactMap.set(contactKey(c), { ...c }));

    // Enrichir depuis les courses
    trips.forEach(trip => {
      const key = tripContactKey(trip);
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
        if (!existing.lastContact || trip.date > existing.lastContact) existing.lastContact = trip.date;
      }
    });

    // Soft delete : les contacts supprimés restent stockés mais sont masqués,
    // sauf si une nouvelle course a été créée pour eux après la suppression.
    return Array.from(contactMap.values()).filter(
      c => !c.deletedAt || c.totalTrips > (c.tripsAtDeletion ?? 0)
    );
  }, [contacts, trips]);

  // Courses regroupées par contact (pour le bon de commande et la facturation)
  const tripsByContact = useMemo(() => {
    const map = new Map<string, Trip[]>();
    trips.forEach(t => {
      const k = tripContactKey(t);
      map.set(k, [...(map.get(k) || []), t]);
    });
    return map;
  }, [trips]);
  const getContactTrips = useCallback((c: Contact) => tripsByContact.get(contactKey(c)) || [], [tripsByContact]);

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

  /* ─── Suppression (soft delete) ─── */
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState(false);

  /**
   * Soft delete : on horodate `deletedAt` au lieu d'effacer la ligne.
   * Les courses et factures du client sont conservées (obligations comptables).
   * Les contacts issus des courses sont mémorisés avec `deletedAt` pour rester masqués.
   */
  const handleDelete = async (contact: Contact) => {
    const deletedAt = new Date().toISOString();
    setDeleting(true);
    try {
      // ── Base de données (à activer quand la table `clients` a une colonne deleted_at) ──
      // const { error } = await supabase.from('clients').update({ deleted_at: deletedAt }).eq('id', contact.id);
      // if (error) throw error;

      const tripsAtDeletion = contact.totalTrips;
      const exists = contacts.some(c => c.id === contact.id);
      const updated = exists
        ? contacts.map(c => (c.id === contact.id ? { ...c, deletedAt, tripsAtDeletion } : c))
        : [{ ...contact, totalTrips: 0, totalRevenue: 0, deletedAt, tripsAtDeletion }, ...contacts];
      saveContacts(updated);
      setSelectedContacts(prev => prev.filter(id => id !== contact.id));
      showToast(`${contact.name} supprimé`, 'info');
      setDeleteTarget(null);
    } catch (err: any) {
      showToast(err?.message || 'Suppression impossible', 'error');
    } finally {
      setDeleting(false);
    }
  };

  /* ─── Facturation à la demande ─── */
  const [invoicingId, setInvoicingId] = useState<string | null>(null);

  /** Génère (ou retélécharge) la facture d'une course précise. */
  const generateInvoice = async (trip: Trip) => {
    if (trip.status === 'invoiced') {
      const inv = invoices.find(i => i.tripId === trip.id);
      if (inv) { downloadInvoice(inv); return; }
    }
    if (trip.status !== 'completed' && trip.status !== 'invoiced') {
      showToast('La facture est disponible une fois la course terminée', 'info');
      return;
    }
    await invoiceTrip(trip);
    showToast(`Facture générée pour ${trip.clientName}`, 'success');
  };

  /** Depuis la carte : facture la dernière course terminée, sinon retélécharge la dernière facture. */
  const generateContactInvoice = async (contact: Contact) => {
    const list = [...getContactTrips(contact)].sort((a, b) => tripTs(b) - tripTs(a));
    const target = list.find(t => t.status === 'completed') || list.find(t => t.status === 'invoiced');
    if (!target) {
      showToast('Aucune course terminée à facturer pour ce client', 'info');
      return;
    }
    setInvoicingId(contact.id);
    try { await generateInvoice(target); } finally { setInvoicingId(null); }
  };

  /* ─── Bon de commande (slide-over) ─── */
  const [orderContact, setOrderContact] = useState<Contact | null>(null);
  const orderTrips = useMemo(() => (orderContact ? getContactTrips(orderContact) : []), [orderContact, getContactTrips]);
  const closeOrder = useCallback(() => setOrderContact(null), []);

  const toggleSelect = (id: string) => {
    setSelectedContacts(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSendSMS = () => {
    // Simulation d'envoi
    setSMSSent(true);
    setTimeout(() => { setSMSSent(false); setShowSMSPanel(false); setSelectedContacts([]); }, 2000);
  };

  const handleGenerateProspects = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    try {
      setIsGeneratingProspects(true);
      const aiProspects = await generateProspects(settings, aiQuery);
      
      const newContacts: Contact[] = aiProspects.map(p => ({
        id: crypto.randomUUID(),
        name: p.name,
        phone: p.phone,
        email: p.email || '',
        type: 'prospect',
        category: p.category,
        source: 'Recherche IA',
        notes: p.notes,
        lastContact: '',
        totalTrips: 0,
        totalRevenue: 0,
        rating: 0,
        tags: ['IA', 'A prospecter'],
        createdAt: format(new Date(), 'yyyy-MM-dd')
      }));

      saveContacts([...newContacts, ...contacts]);
      showToast('5 nouveaux prospects trouvés par l\'IA !', 'success');
      setActiveTab('prospects');
      setShowAIModal(false);
      setAiQuery('');
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setIsGeneratingProspects(false);
    }
  };


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
              <span className="text-xs sm:text-xs font-medium text-slate-400">{s.label}</span>
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
          <button 
            onClick={() => setShowAIModal(true)} 
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-600/30"
          >
            <Sparkles className="w-4 h-4" /> Prospects IA
          </button>
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
          {filtered.map(contact => (
            <ContactCard
              key={contact.id}
              contact={contact}
              selected={selectedContacts.includes(contact.id)}
              invoicing={invoicingId === contact.id}
              onToggleSelect={() => toggleSelect(contact.id)}
              onOpen={() => setOrderContact(contact)}
              onRequestDelete={() => setDeleteTarget(contact)}
              onGenerateInvoice={() => generateContactInvoice(contact)}
            />
          ))}
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

      <AnimatePresence>
        {showAIModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="glass w-full max-w-lg rounded-3xl p-8 border border-purple-500/30 shadow-2xl shadow-purple-500/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" /> Générateur de Prospects IA
                </h3>
                <button onClick={() => setShowAIModal(false)} className="p-2 hover:bg-white/10 rounded-full text-white"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleGenerateProspects} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Que recherchez-vous ?
                  </label>
                  <textarea 
                    required
                    rows={3}
                    placeholder="Ex: Hôtels de luxe 5 étoiles à Cannes, Monaco et Nice"
                    value={aiQuery}
                    onChange={e => setAiQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none text-sm resize-none focus:border-purple-500/50"
                  />
                  <p className="text-xs text-slate-400 mt-2">
                    L'IA va chercher sur internet et générer 5 prospects pertinents pour cette demande, avec leur numéro de téléphone et un conseil d'approche.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAIModal(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 font-medium">Annuler</button>
                  <button type="submit" disabled={isGeneratingProspects} className="flex-1 py-3 rounded-xl bg-purple-600 text-white hover:bg-purple-500 font-bold flex justify-center items-center gap-2">
                    {isGeneratingProspects ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {isGeneratingProspects ? 'Recherche en cours...' : 'Générer (5 cibles)'}
                  </button>
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

      {/* ──── MODALE : Confirmation de suppression ──── */}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Supprimer ce contact ?"
        message="Voulez-vous vraiment supprimer cet élément ?"
        detail={deleteTarget ? `${deleteTarget.name}${deleteTarget.totalTrips ? ` · ses ${deleteTarget.totalTrips} course(s) et factures sont conservées` : ''}` : undefined}
        loading={deleting}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ──── SLIDE-OVER : Bon de commande ──── */}
      <OrderSlideOver
        open={!!orderContact}
        clientName={orderContact?.name || ''}
        clientPhone={orderContact?.phone}
        trips={orderTrips}
        onClose={closeOrder}
        onDownloadBon={generateBon}
        onGenerateInvoice={generateInvoice}
      />
    </motion.div>
  );
}
