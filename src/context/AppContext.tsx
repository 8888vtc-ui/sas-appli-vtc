import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { supabase, isLocalMode } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Trip, AppSettings, LegalDocument, InvoiceRecord, Expense, MileageLog } from '../types';
import { DEFAULT_SETTINGS, LEGAL_DOC_TEMPLATES } from '../types';
import { generateBonDeCommande, generateMiseADisposition, generateFacture, downloadInvoicePDF } from '../lib/pdfGenerators';
import { getStats, getVaultComplianceScore, getDocExpiryStatus } from '../lib/utils';
import { format } from 'date-fns';

const SAMPLE_TRIPS: Trip[] = [
  {
    id: 'demo-trip-1',
    clientName: 'Alexandre de La Tour',
    clientPhone: '+33 6 45 89 12 30',
    clientEmail: 'alexandre.latour@luxurygroup.com',
    pickUpLocation: 'Aéroport Nice Côte d\'Azur (NCE) Terminal 2',
    dropOffLocation: 'Hôtel Martinez, Cannes',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '14:30',
    bookingDateTime: format(new Date(), 'dd/MM/yyyy HH:mm'),
    flightNumber: 'AF 7702',
    passengerCount: 2,
    price: 110,
    tripType: 'transfer',
    status: 'scheduled',
    notes: 'Client VIP - Prévoir bouteille d\'eau Evian et presse économique.'
  },
  {
    id: 'demo-trip-2',
    clientName: 'Sophia Miller',
    clientPhone: '+44 7700 900123',
    clientEmail: 'sophia.miller@monaco-invest.mc',
    pickUpLocation: 'Hôtel de Paris, Monaco',
    dropOffLocation: 'Palais des Festivals, Cannes',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '18:00',
    bookingDateTime: format(new Date(), 'dd/MM/yyyy HH:mm'),
    passengerCount: 3,
    price: 380,
    tripType: 'disposal',
    disposalEndDate: format(new Date(), 'yyyy-MM-dd'),
    disposalEndTime: '23:00',
    disposalZone: 'Monaco / Nice / Cannes',
    status: 'in_progress',
    notes: 'Mise à disposition pour soirée gala cinéma.'
  },
  {
    id: 'demo-trip-3',
    clientName: 'Marc Lefebvre',
    clientPhone: '+33 6 11 22 33 44',
    clientEmail: 'm.lefebvre@tech-solutions.fr',
    pickUpLocation: 'Gare de Cannes',
    dropOffLocation: 'Sophia Antipolis',
    date: format(new Date(Date.now() - 86400000), 'yyyy-MM-dd'),
    time: '09:15',
    bookingDateTime: format(new Date(Date.now() - 86400000), 'dd/MM/yyyy 08:30'),
    passengerCount: 1,
    price: 65,
    tripType: 'transfer',
    status: 'completed',
    notes: 'Transfert professionnel entreprise.'
  }
];

const SAMPLE_EXPENSES: Expense[] = [
  { id: 'exp-1', description: 'Carburant TotalEnergies Excellium', amount: 85.50, category: 'fuel', date: format(new Date(), 'yyyy-MM-dd'), tvaDeductible: false, tvaRate: 20, tvaAmount: 0, createdAt: new Date().toISOString() },
  { id: 'exp-2', description: 'Assurance RC Pro & Circulation', amount: 160.00, category: 'insurance', date: format(new Date(), 'yyyy-MM-dd'), tvaDeductible: false, tvaRate: 20, tvaAmount: 0, createdAt: new Date().toISOString() },
  { id: 'exp-3', description: 'Péage A8 Nice-Cannes A/R', amount: 12.40, category: 'toll', date: format(new Date(), 'yyyy-MM-dd'), tvaDeductible: true, tvaRate: 20, tvaAmount: 2.07, createdAt: new Date().toISOString() },
];

const SAMPLE_MILEAGE: MileageLog[] = [
  { id: 'ml-1', date: format(new Date(), 'yyyy-MM-dd'), startKm: 45230, endKm: 45285, distance: 55, purpose: 'professional', description: 'Nice Aéroport → Cannes Martinez', createdAt: new Date().toISOString() },
];

const DEFAULT_LEGAL_DOCS: LegalDocument[] = LEGAL_DOC_TEMPLATES.map((tmpl, idx) => ({
  id: `doc-${idx + 1}`,
  name: tmpl.name,
  category: tmpl.category,
  scope: tmpl.scope,
  legalBasis: tmpl.legalBasis,
  description: tmpl.description,
  isRequired: tmpl.isRequired,
  expiryDate: undefined,
  fileData: undefined,
  fileName: undefined,
  uploadDate: undefined
}));

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
  downloadInvoice: (inv: InvoiceRecord) => void;
  updateSettings: (s: AppSettings) => Promise<void>;
  updateDocExpiry: (docId: string, date: string) => Promise<void>;
  triggerUpload: (docId: string) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  removeDocumentFile: (docId: string) => Promise<void>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  togglePayment: (invoiceId: string) => Promise<void>;
  deleteInvoice: (invoiceId: string) => Promise<void>;
  addSignature: (tripId: string, signature: string) => Promise<void>;
  expenses: Expense[];
  addExpense: (data: any) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  mileageLogs: MileageLog[];
  addMileageLog: (data: any) => Promise<void>;
  deleteMileageLog: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [legalDocs, setLegalDocs] = useState<LegalDocument[]>(DEFAULT_LEGAL_DOCS);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [mileageLogs, setMileageLogs] = useState<MileageLog[]>([]);
  const [invoiceCounter, setInvoiceCounter] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadDocId, setUploadDocId] = useState<string | null>(null);

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
    // Trips
    const t = localStorage.getItem('vtc_local_trips');
    if (t) {
      try { setTrips(JSON.parse(t)); } catch { setTrips(SAMPLE_TRIPS); }
    } else {
      setTrips(SAMPLE_TRIPS);
      localStorage.setItem('vtc_local_trips', JSON.stringify(SAMPLE_TRIPS));
    }

    // Expenses
    const e = localStorage.getItem('vtc_local_expenses');
    if (e) {
      try { setExpenses(JSON.parse(e)); } catch { setExpenses(SAMPLE_EXPENSES); }
    } else {
      setExpenses(SAMPLE_EXPENSES);
      localStorage.setItem('vtc_local_expenses', JSON.stringify(SAMPLE_EXPENSES));
    }

    // Invoices
    const i = localStorage.getItem('vtc_local_invoices');
    if (i) {
      try { setInvoices(JSON.parse(i)); } catch { setInvoices([]); }
    }

    // Mileage Logs
    const ml = localStorage.getItem('vtc_local_mileage');
    if (ml) {
      try { setMileageLogs(JSON.parse(ml)); } catch { setMileageLogs(SAMPLE_MILEAGE); }
    } else {
      setMileageLogs(SAMPLE_MILEAGE);
      localStorage.setItem('vtc_local_mileage', JSON.stringify(SAMPLE_MILEAGE));
    }

    // Invoice counter
    const c = localStorage.getItem('vtc_invoice_counter');
    if (c) {
      setInvoiceCounter(parseInt(c) || 1);
    }

    // Legal Docs (Vault)
    const d = localStorage.getItem('vtc_local_docs');
    if (d) {
      try { 
        const parsed = JSON.parse(d);
        // Force migration: Always ensure existing docs get the correct scope from templates
        const migratedDocs = parsed.map((p: any) => {
          const template = DEFAULT_LEGAL_DOCS.find(d => d.id === p.id || d.name === p.name);
          if (template) {
            return {
              ...p,
              scope: template.scope,
              legalBasis: template.legalBasis,
              category: template.category,
              isRequired: template.isRequired
            };
          }
          return p;
        });
        
        // Add any new templates that might be missing from localStorage
        DEFAULT_LEGAL_DOCS.forEach(template => {
          if (!migratedDocs.find((m: any) => m.id === template.id)) {
            migratedDocs.push(template);
          }
        });
        
        setLegalDocs(migratedDocs);
      } catch { setLegalDocs(DEFAULT_LEGAL_DOCS); }
    } else {
      setLegalDocs(DEFAULT_LEGAL_DOCS);
      localStorage.setItem('vtc_local_docs', JSON.stringify(DEFAULT_LEGAL_DOCS));
    }

    // Profile & Settings
    const p = localStorage.getItem('vtc_local_profile');
    if (p) {
      try {
        const parsed = JSON.parse(p);
        if (parsed.company) {
          setSettings(prev => ({
            ...prev,
            companyName: parsed.company.name || prev.companyName,
            companyAddress: parsed.company.address || prev.companyAddress,
            companyPhone: parsed.company.phone || prev.companyPhone,
            companyEmail: parsed.company.email || prev.companyEmail,
            siret: parsed.company.siret || prev.siret,
            siren: parsed.company.siren || prev.siren,
            registreVTC: parsed.company.registre_vtc || prev.registreVTC,
            tvaRegime: parsed.company.tva_regime || prev.tvaRegime,
            tvaRate: parsed.company.tva_rate || prev.tvaRate || 10,
            welcomeMessage: parsed.company.welcome_message || prev.welcomeMessage,
            logoColor: parsed.company.logo_color || prev.logoColor,
            driverName: parsed.full_name || prev.driverName,
            driverPhone: parsed.phone || prev.driverPhone,
            driverCardNumber: parsed.driver_card_number || prev.driverCardNumber,
          }));
        }
      } catch { /* ignore */ }
    }
  };

  const syncLocal = (key: string, data: any) => {
    if (isLocalMode) localStorage.setItem(key, JSON.stringify(data));
  };

  const fetchData = async () => {
    if (!profile?.company_id) return;
    const { data: comp } = await supabase.from('companies').select('*').eq('id', profile.company_id).single();
    if (comp) setSettings(prev => ({
      ...prev,
      companyName: comp.name || prev.companyName,
      companyAddress: comp.address || prev.companyAddress,
      companyPhone: comp.phone || prev.companyPhone,
      companyEmail: comp.email || prev.companyEmail,
      siret: comp.siret || prev.siret,
      siren: comp.siren || prev.siren,
      registreVTC: comp.registre_vtc || prev.registreVTC,
      driverName: profile.full_name || prev.driverName,
      driverCardNumber: profile.driver_card_number || prev.driverCardNumber,
      driverPhone: profile.phone || prev.driverPhone,
      welcomeMessage: comp.welcome_message || prev.welcomeMessage,
      logoColor: comp.logo_color || prev.logoColor,
      tvaRegime: comp.tva_regime || prev.tvaRegime,
      tvaNumber: comp.tva_number || prev.tvaNumber
    }));

    const { data: tData } = await supabase.from('trips').select('*').eq('company_id', profile.company_id).order('date', { ascending: false });
    if (tData) {
      const mappedTrips = tData.map((t: any) => ({
        id: t.id,
        clientName: t.client_name,
        clientPhone: t.client_phone,
        clientEmail: t.client_email,
        pickUpLocation: t.pickup_location,
        dropOffLocation: t.dropoff_location,
        date: t.date,
        time: t.time,
        flightNumber: t.flight_number,
        passengerCount: t.passenger_count,
        price: t.price,
        tripType: t.trip_type,
        status: t.status,
        bookingDateTime: t.booking_datetime,
        notes: t.notes,
        invoiceNumber: t.invoice_number
      }));
      setTrips(mappedTrips as any);
    }

    const { data: dData } = await supabase.from('documents').select('*').eq('company_id', profile.company_id);
    if (dData && dData.length > 0) {
      // Force migration for remote docs
      const migratedDocs = dData.map((p: any) => {
        const template = DEFAULT_LEGAL_DOCS.find(d => d.id === p.id || d.name === p.name);
        if (template) {
          return {
            ...p,
            scope: template.scope,
            legalBasis: template.legalBasis,
            category: template.category,
            isRequired: template.isRequired
          };
        }
        return p;
      });
      
      DEFAULT_LEGAL_DOCS.forEach(template => {
        if (!migratedDocs.find((m: any) => m.id === template.id)) {
          migratedDocs.push(template);
        }
      });
      
      setLegalDocs(migratedDocs);
    } else {
      setLegalDocs(DEFAULT_LEGAL_DOCS);
    }

    const { data: invData } = await supabase.from('invoices').select('*').eq('company_id', profile.company_id).order('created_at', { ascending: false });
    if (invData) {
      setInvoices(invData.map((inv: any) => ({
        id: inv.id,
        tripId: inv.trip_id,
        invoiceNumber: inv.invoice_number,
        clientName: inv.client_name || 'Client',
        clientPhone: inv.client_phone || '',
        date: inv.created_at ? format(new Date(inv.created_at), 'dd/MM/yyyy') : '',
        amount: Number(inv.amount || 0),
        tvaAmount: Number(inv.tva_amount || 0),
        totalTTC: Number(inv.total_ttc || 0),
        paymentStatus: inv.status === 'paid' ? 'paid' : 'pending',
        createdAt: inv.created_at
      })));
    }

    const { data: expData } = await supabase.from('expenses').select('*').eq('company_id', profile.company_id).order('date', { ascending: false });
    if (expData) setExpenses(expData);
  };

  const addTrip = async (formData: any) => {
    if (isLocalMode) {
      const newTrip: Trip = {
        ...formData,
        id: crypto.randomUUID(),
        bookingDateTime: format(new Date(), 'dd/MM/yyyy HH:mm'),
        status: 'scheduled'
      };
      const updated = [newTrip, ...trips];
      setTrips(updated);
      syncLocal('vtc_local_trips', updated);
      return;
    }
    if (!profile?.company_id) return;
    
    // Map camelCase formData to snake_case schema for Supabase
    const dbPayload = {
      company_id: profile.company_id,
      client_name: formData.clientName,
      client_phone: formData.clientPhone,
      client_email: formData.clientEmail,
      pickup_location: formData.pickUpLocation,
      dropoff_location: formData.dropOffLocation,
      date: formData.date,
      time: formData.time,
      booking_datetime: format(new Date(), 'dd/MM/yyyy HH:mm'),
      flight_number: formData.flightNumber,
      passenger_count: formData.passengerCount,
      price: formData.price,
      trip_type: formData.tripType,
      status: 'scheduled',
      notes: formData.notes
    };

    const { error } = await supabase.from('trips').insert([dbPayload]);
    if (error) {
      console.error("Error creating trip:", error);
      alert("Erreur lors de la création de la course : " + error.message);
    } else {
      fetchData(); // Force refresh to show the new trip
    }
  };

  const deleteTrip = async (id: string) => {
    // Optimistic UI updates
    const updatedTrips = trips.filter(t => t.id !== id);
    const updatedInvoices = invoices.filter(inv => inv.tripId !== id);
    
    setTrips(updatedTrips);
    setInvoices(updatedInvoices);
    
    if (isLocalMode) {
      syncLocal('vtc_local_trips', updatedTrips);
      syncLocal('vtc_local_invoices', updatedInvoices);
      return;
    }
    
    // Remote deletes: Delete invoices first to satisfy Postgres Foreign Key constraints!
    await supabase.from('invoices').delete().eq('trip_id', id);
    await supabase.from('trips').delete().eq('id', id);
  };

  const changeStatus = async (tripId: string, status: Trip['status']) => {
    if (isLocalMode) {
      const updated = trips.map(t => t.id === tripId ? { ...t, status } : t);
      setTrips(updated);
      syncLocal('vtc_local_trips', updated);
      return;
    }
    const { error } = await supabase.from('trips').update({ status }).eq('id', tripId);
    if (!error) fetchData();
  };

  const invoiceTrip = async (trip: Trip) => {
    const num = `F-${new Date().getFullYear()}-${String(invoiceCounter).padStart(4, '0')}`;
    const result = generateFacture(trip, settings, num);
    const newInvoice: InvoiceRecord = {
      id: crypto.randomUUID(),
      tripId: trip.id,
      invoiceNumber: num,
      clientName: trip.clientName,
      clientPhone: trip.clientPhone,
      date: trip.date ? format(new Date(trip.date), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy'),
      amount: trip.price,
      tvaAmount: result.tvaAmount,
      totalTTC: result.total,
      paymentStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    const updatedInvoices = [newInvoice, ...invoices];
    setInvoices(updatedInvoices);
    syncLocal('vtc_local_invoices', updatedInvoices);

    const nextCounter = invoiceCounter + 1;
    setInvoiceCounter(nextCounter);
    syncLocal('vtc_invoice_counter', nextCounter);

    await changeStatus(trip.id, 'invoiced');

    if (!isLocalMode && profile?.company_id) {
      await supabase.from('invoices').insert([{
        company_id: profile.company_id,
        trip_id: trip.id,
        invoice_number: num,
        amount: trip.price,
        tva_amount: result.tvaAmount,
        total_ttc: result.total,
        status: 'pending'
      }]);
    }
  };

  const togglePayment = async (invoiceId: string) => {
    const updated = invoices.map(inv => {
      if (inv.id === invoiceId) {
        const nextStatus: 'pending' | 'paid' = inv.paymentStatus === 'paid' ? 'pending' : 'paid';
        return { ...inv, paymentStatus: nextStatus };
      }
      return inv;
    });
    setInvoices(updated);
    syncLocal('vtc_local_invoices', updated);

    if (!isLocalMode && profile?.company_id) {
      const target = updated.find(i => i.id === invoiceId);
      if (target) {
        await supabase.from('invoices').update({ status: target.paymentStatus }).eq('id', invoiceId);
      }
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    const updated = invoices.filter(inv => inv.id !== invoiceId);
    setInvoices(updated);
    syncLocal('vtc_local_invoices', updated);
    
    if (!isLocalMode && profile?.company_id) {
      await supabase.from('invoices').delete().eq('id', invoiceId);
    }
  };

  const addExpense = async (data: any) => {
    if (isLocalMode) {
      const newExp: Expense = {
        id: crypto.randomUUID(),
        description: data.description || '',
        amount: Number(data.amount) || 0,
        category: data.category || 'other',
        date: data.date || format(new Date(), 'yyyy-MM-dd'),
        tvaDeductible: data.tvaDeductible || false,
        tvaRate: Number(data.tvaRate) || 20,
        tvaAmount: Number(data.tvaAmount) || 0,
        receiptPhoto: data.receiptPhoto,
        receiptFileName: data.receiptFileName,
        notes: data.notes,
        createdAt: new Date().toISOString(),
      };
      const updated = [newExp, ...expenses];
      setExpenses(updated);
      syncLocal('vtc_local_expenses', updated);
      return;
    }
    if (!profile?.company_id) return;
    await supabase.from('expenses').insert([{ ...data, company_id: profile.company_id }]);
  };

  const deleteExpense = async (id: string) => {
    if (isLocalMode) {
      const updated = expenses.filter(e => e.id !== id);
      setExpenses(updated);
      syncLocal('vtc_local_expenses', updated);
      return;
    }
    await supabase.from('expenses').delete().eq('id', id);
  };

  const addMileageLog = async (data: any) => {
    if (isLocalMode) {
      const newLog: MileageLog = {
        id: crypto.randomUUID(),
        date: data.date || format(new Date(), 'yyyy-MM-dd'),
        startKm: Number(data.startKm) || 0,
        endKm: Number(data.endKm) || 0,
        distance: (Number(data.endKm) || 0) - (Number(data.startKm) || 0),
        purpose: data.purpose || 'professional',
        description: data.description || '',
        tripId: data.tripId,
        createdAt: new Date().toISOString(),
      };
      const updated = [newLog, ...mileageLogs];
      setMileageLogs(updated);
      syncLocal('vtc_local_mileage', updated);
      return;
    }
  };

  const deleteMileageLog = async (id: string) => {
    if (isLocalMode) {
      const updated = mileageLogs.filter(m => m.id !== id);
      setMileageLogs(updated);
      syncLocal('vtc_local_mileage', updated);
      return;
    }
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
        parsed.company = { ...parsed.company, ...s };
        parsed.full_name = s.driverName;
        parsed.phone = s.driverPhone;
        parsed.driver_card_number = s.driverCardNumber;
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

  const triggerUpload = (id: string) => {
    setUploadDocId(id);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadDocId) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const today = format(new Date(), 'dd/MM/yyyy');
      const updated = legalDocs.map(d => {
        if (d.id === uploadDocId) {
          return {
            ...d,
            fileName: file.name,
            fileData: base64,
            uploadDate: today
          };
        }
        return d;
      });
      setLegalDocs(updated);
      syncLocal('vtc_local_docs', updated);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeDocumentFile = async (docId: string) => {
    const updated = legalDocs.map(d => d.id === docId ? { ...d, fileName: undefined, fileData: undefined, uploadDate: undefined } : d);
    setLegalDocs(updated);
    syncLocal('vtc_local_docs', updated);
  };

  const updateDocExpiry = async (docId: string, date: string) => {
    const updated = legalDocs.map(d => d.id === docId ? { ...d, expiryDate: date } : d);
    setLegalDocs(updated);
    syncLocal('vtc_local_docs', updated);
  };

  const stats = getStats(trips);
  const compliance = getVaultComplianceScore(legalDocs);
  const expiringSoon = legalDocs.filter(d => {
    const st = getDocExpiryStatus(d);
    return st === 'soon' || st === 'expired';
  });

  const downloadInvoice = (inv: InvoiceRecord) => {
    const trip = trips.find(t => t.id === inv.tripId);
    downloadInvoicePDF(inv, settings, trip);
  };

  return (
    <AppContext.Provider value={{
      trips, settings, legalDocs, invoices, stats, compliance, expiringSoon,
      addTrip, deleteTrip, changeStatus, invoiceTrip, updateSettings, updateDocExpiry,
      triggerUpload, handleFileChange, removeDocumentFile, fileInputRef,
      togglePayment,
      deleteInvoice,
      addSignature,
      generateBon: (t) => generateBonDeCommande(t, settings),
      generateMAD: (t) => generateMiseADisposition(t, settings),
      downloadInvoice,
      expenses,
      addExpense,
      deleteExpense,
      mileageLogs,
      addMileageLog,
      deleteMileageLog,
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
