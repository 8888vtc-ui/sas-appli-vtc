// ─── TRIP ───
export interface Trip {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  pickUpLocation: string;
  dropOffLocation: string;
  date: string;
  time: string;
  bookingDateTime: string;
  flightNumber?: string;
  passengerCount: number;
  price: number;
  tripType: 'transfer' | 'disposal';
  disposalEndDate?: string;
  disposalEndTime?: string;
  disposalZone?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'invoiced';
  invoiceNumber?: string;
  paymentStatus?: 'pending' | 'paid';
  signature?: string; // Base64 signature image
  notes?: string;
}

// ─── SETTINGS ───
export interface AppSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  siret: string;
  siren: string;
  registreVTC: string;
  driverName: string;
  driverCardNumber: string;
  driverPhone: string;
  vehiclePlate: string;
  vehicleModel: string;
  welcomeMessage: string;
  logoColor: string;
  tvaRegime: 'franchise' | 'assujetti';
  tvaRate?: number; // Taux de TVA (10% par défaut pour VTC)
  tvaNumber: string;
}

// ─── LEGAL DOCUMENT (VAULT) ───
export interface LegalDocument {
  id: string;
  name: string;
  category: 'driver' | 'vehicle' | 'admin';
  expiryDate?: string;
  fileData?: string;
  fileName?: string;
  uploadDate?: string;
  isRequired: boolean;
}

// ─── INVOICE RECORD ───
export interface InvoiceRecord {
  id: string;
  tripId: string;
  invoiceNumber: string;
  clientName: string;
  clientPhone: string;
  date: string;
  amount: number;
  tvaAmount: number;
  totalTTC: number;
  paymentStatus: 'pending' | 'paid';
  createdAt: string;
}

// ─── VIEW TYPE ───
export type View = 'dashboard' | 'sign' | 'settings' | 'vault' | 'vault-control' | 'invoices';

// ─── DEFAULTS ───
export const DEFAULT_SETTINGS: AppSettings = {
  companyName: 'AZUR PRESTIGE VTC',
  companyAddress: '15 Boulevard de la Croisette, 06400 Cannes',
  companyPhone: '+33 4 93 00 11 22',
  companyEmail: 'contact@azur-prestige-vtc.fr',
  siret: '892 456 789 00015',
  siren: '892 456 789',
  registreVTC: 'EVTC060240098',
  driverName: 'Alexandre Martin',
  driverCardNumber: 'T-060-24-00128-V',
  driverPhone: '+33 6 12 34 56 78',
  vehiclePlate: 'GH-890-JK',
  vehicleModel: 'Mercedes-Benz Classe E Berline',
  welcomeMessage: 'BIENVENUE / WELCOME',
  logoColor: '#3B82F6',
  tvaRegime: 'franchise',
  tvaRate: 10,
  tvaNumber: ''
};

export const LEGAL_DOC_TEMPLATES: Omit<LegalDocument, 'id'>[] = [
  { name: 'Carte Professionnelle VTC', category: 'driver', isRequired: true },
  { name: 'Permis de Conduire', category: 'driver', isRequired: true },
  { name: 'Certificat Médical', category: 'driver', isRequired: true },
  { name: 'Attestation de Formation Continue', category: 'driver', isRequired: false },
  { name: 'Carte Grise', category: 'vehicle', isRequired: true },
  { name: 'Attestation Assurance RC Pro', category: 'vehicle', isRequired: true },
  { name: 'Contrôle Technique Annuel', category: 'vehicle', isRequired: true },
  { name: 'Vignette Crit\'Air', category: 'vehicle', isRequired: false },
  { name: 'Inscription Registre VTC', category: 'admin', isRequired: true },
  { name: 'Extrait Kbis / INSEE', category: 'admin', isRequired: true },
  { name: 'Attestation URSSAF', category: 'admin', isRequired: false },
  { name: 'Attestation de Vigilance', category: 'admin', isRequired: false },
];

// ─── COMPANY DRIVER / USER ───
export interface CompanyDriver {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  driverCardNumber: string;
  cardExpiryDate?: string;
  role: 'admin' | 'driver';
  status: 'active' | 'inactive';
  createdAt?: string;
}
