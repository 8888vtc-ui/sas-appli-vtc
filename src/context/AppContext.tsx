import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { supabase, isLocalMode } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Trip, AppSettings, LegalDocument, InvoiceRecord } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { generateBonDeCommande, generateMiseADisposition, generateFacture } from '../lib/pdfGenerators';
import { getStats, getVaultComplianceScore } from '../lib/utils';
import { format } from 'date-fns';

interface AppContextType {
  trips: Trip[];
  settings: AppSettings;
  legalDocs: LegalDocument[];
  invoices: InvoiceRecord[];
  stats: any;
  compliance: any;
  expiringSoon: LegalDocument[];
  addTrip: (formData: any) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  changeStatus: (tripId: string, status: Trip['status']) => Promise<void>;
  invoiceTrip: (trip: Trip) => Promise<void>;
  generateBon: (trip: Trip) => void;
  generateMAD: (trip: Trip) => void;
  updateSettings: (s: AppSettings) => Promise<void>;
  updateDocExpiry: (docId: string, date: string) => Promise<void>;
  triggerUpload: (docId: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  togglePayment: (invoiceId: string) => Promise<void>;
  addSignature: (tripId: string, signature: string) => Promise<void>;
  expenses: any[];
  addExpense: (data: any) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [legalDocs, setLegalDocs] = useState<LegalDocument[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [invoiceCounter, setInvoiceCounter] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [_uploadDocId, setUploadDocId] = useState<string | null>(null);

  // Charger les données initiales
  useEffect(() => {
    if (user) {
      if (isLocalMode) {
        loadDataLocal();
      } else if (profile?.company_id) {
        fetchData();
        const channel = supabase.channel('app_changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'trips', filter: `company_id=eq.${profile.company_id}` }, () => fetchData())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'documents', filter: `company_id=eq.${profile.company_id}` }, () => fetchData())
          .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices', filter: `company_id=eq.${profile.company_id}` }, () => fetchData())
          .subscribe();
        return () => { supabase.removeChannel(channel); };
      }
    }
  }, [user, profile]);

  const loadDataLocal = () => {
    const t = localStorage.getItem('vtc_local_trips');
    const e = localStorage.getItem('vtc_local_expenses');
    const i = localStorage.getItem('vtc_local_invoices');
    const p = localStorage.getItem('vtc_local_profile');
    
    if (t) setTrips(JSON.parse(t));
    if (e) setExpenses(JSON.parse(e));
    if (i) setInvoices(JSON.parse(i));
    if (p) {
      const parsed = JSON.parse(p);
      if (parsed.company) setSettings({ ...DEFAULT_SETTINGS, ...parsed.company });
    }
  };

  const syncLocal = (key: string, data: any) => {
    if (isLocalMode) localStorage.setItem(key, JSON.stringify(data));
  };

  const fetchData = async () => {
    if (!profile?.company_id) return;
    const { data: comp } = await supabase.from('companies').select('*').eq('id', profile.company_id).single();
    if (comp) setSettings({
      companyName: comp.name, companyAddress: comp.address || '', companyPhone: comp.phone || '',
      companyEmail: comp.email || '', siret: comp.siret || '', siren: comp.siren || '',
      registreVTC: comp.registre_vtc || '', driverName: profile.full_name || '',
      driverCardNumber: profile.driver_card_number || '', driverPhone: profile.phone || '',
      vehiclePlate: '', vehicleModel: '', welcomeMessage: comp.welcome_message || 'BIENVENUE',
      logoColor: comp.logo_color || '#FFD700', tvaRegime: comp.tva_regime || 'franchise',
      tvaNumber: comp.tva_number || ''
    });
    const { data: tData } = await supabase.from('trips').select('*').eq('company_id', profile.company_id).order('date', { ascending: false });
    if (tData) setTrips(tData as any);
    const { data: dData } = await supabase.from('documents').select('*').eq('company_id', profile.company_id);
    if (dData) setLegalDocs(dData as any);
    const { data: invData } = await supabase.from('invoices').select('*').eq('company_id', profile.company_id).order('created_at', { ascending: false });
    if (invData) setInvoices(invData as any);
    const { data: expData } = await supabase.from('expenses').select('*').eq('company_id', profile.company_id).order('date', { ascending: false });
    if (expData) setExpenses(expData);
  };

  const addTrip = async (formData: any) => {
    if (isLocalMode) {
      const newTrip = { ...formData, id: crypto.randomUUID(), booking_datetime: format(new Date(), 'dd/MM/yyyy HH:mm'), status: 'scheduled' };
      const updated = [newTrip, ...trips];
      setTrips(updated);
      syncLocal('vtc_local_trips', updated);
      return;
    }
    if (!profile?.company_id) return;
    await supabase.from('trips').insert([{ ...formData, company_id: profile.company_id, booking_datetime: format(new Date(), 'dd/MM/yyyy HH:mm'), status: 'scheduled' }]);
  };

  const deleteTrip = async (id: string) => {
    if (isLocalMode) {
      const updated = trips.filter(t => t.id !== id);
      setTrips(updated);
      syncLocal('vtc_local_trips', updated);
      return;
    }
    await supabase.from('trips').delete().eq('id', id);
  };

  const changeStatus = async (tripId: string, status: Trip['status']) => {
    if (isLocalMode) {
      const updated = trips.map(t => t.id === tripId ? { ...t, status } : t);
      setTrips(updated);
      syncLocal('vtc_local_trips', updated);
      return;
    }
    await supabase.from('trips').update({ status }).eq('id', tripId);
  };

  const invoiceTrip = async (trip: Trip) => {
    const num = `F-${new Date().getFullYear()}-${String(invoiceCounter).padStart(4, '0')}`;
    const result = generateFacture(trip, settings, num);
    if (isLocalMode) {
      const newInvoice = { id: crypto.randomUUID(), trip_id: trip.id, invoice_number: num, amount: trip.price, tva_amount: result.tvaAmount, total_ttc: result.total, status: 'pending', created_at: new Date().toISOString() };
      const updatedInvoices = [newInvoice as any, ...invoices];
      setInvoices(updatedInvoices);
      syncLocal('vtc_local_invoices', updatedInvoices);
      changeStatus(trip.id, 'invoiced');
      setInvoiceCounter(prev => prev + 1);
      return;
    }
    if (!profile?.company_id) return;
    await supabase.from('invoices').insert([{ company_id: profile.company_id, trip_id: trip.id, invoice_number: num, amount: trip.price, tva_amount: result.tvaAmount, total_ttc: result.total, status: 'pending' }]);
    await changeStatus(trip.id, 'invoiced');
    setInvoiceCounter(prev => prev + 1);
  };

  const addExpense = async (data: any) => {
    if (isLocalMode) {
      const newExp = { ...data, id: crypto.randomUUID(), created_at: new Date().toISOString() };
      const updated = [newExp, ...expenses];
      setExpenses(updated);
      syncLocal('vtc_local_expenses', updated);
      return;
    }
    if (!profile?.company_id) return;
    await supabase.from('expenses').insert([{ ...data, company_id: profile.company_id }]);
  };

  const addSignature = async (tripId: string, signature: string) => {
    if (isLocalMode) {
      const updated = trips.map(t => t.id === tripId ? { ...t, signature } : t);
      setTrips(updated);
      syncLocal('vtc_local_trips', updated);
      return;
    }
    await supabase.from('trips').update({ signature }).eq('id', tripId);
  };

  const updateSettings = async (s: AppSettings) => {
    setSettings(s);
    if (isLocalMode) {
      const p = localStorage.getItem('vtc_local_profile');
      if (p) {
        const parsed = JSON.parse(p);
        parsed.company = s;
        localStorage.setItem('vtc_local_profile', JSON.stringify(parsed));
      }
      return;
    }
    if (!profile?.company_id) return;
    await supabase.from('companies').update({
       name: s.companyName, address: s.companyAddress, phone: s.companyPhone,
       email: s.companyEmail, siret: s.siret, siren: s.siren, registre_vtc: s.registreVTC,
       tva_regime: s.tvaRegime, tva_number: s.tvaNumber, welcome_message: s.welcomeMessage,
       logo_color: s.logoColor
    }).eq('id', profile.company_id);
  };

  const triggerUpload = (id: string) => { setUploadDocId(id); fileInputRef.current?.click(); };
  const handleFileChange = async () => {}; // Storage non supporté en mode local simple
  const updateDocExpiry = async () => {};

  const stats = getStats(trips);
  const compliance = getVaultComplianceScore(legalDocs);
  const expiringSoon: any[] = [];

  return (
    <AppContext.Provider value={{
      trips, settings, legalDocs, invoices, stats, compliance, expiringSoon,
      addTrip, deleteTrip, changeStatus, invoiceTrip, updateSettings, updateDocExpiry,
      triggerUpload, handleFileChange, fileInputRef,
      togglePayment: async () => {},
      addSignature,
      generateBon: (t) => generateBonDeCommande(t, settings),
      generateMAD: (t) => generateMiseADisposition(t, settings),
      expenses,
      addExpense
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};
