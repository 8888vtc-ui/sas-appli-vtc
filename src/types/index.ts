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

// ─── EXPENSE CATEGORIES ───
export const EXPENSE_CATEGORIES = {
  fuel: { label: 'Carburant', icon: '⛽', color: '#3b82f6' },
  toll: { label: 'Péages', icon: '🛣️', color: '#8b5cf6' },
  parking: { label: 'Parking', icon: '🅿️', color: '#06b6d4' },
  wash: { label: 'Lavage véhicule', icon: '🧽', color: '#14b8a6' },
  maintenance: { label: 'Entretien / Réparation', icon: '🔧', color: '#f59e0b' },
  insurance: { label: 'Assurance', icon: '🛡️', color: '#ec4899' },
  phone: { label: 'Téléphone / Internet', icon: '📱', color: '#6366f1' },
  fees: { label: 'Commissions plateforme', icon: '💳', color: '#ef4444' },
  lease: { label: 'Location / Leasing', icon: '🚗', color: '#84cc16' },
  fine: { label: 'Amende / PV', icon: '⚠️', color: '#dc2626' },
  supplies: { label: 'Fournitures (eau, presse...)', icon: '🛒', color: '#0ea5e9' },
  accounting: { label: 'Comptabilité / Expert', icon: '📊', color: '#a855f7' },
  training: { label: 'Formation continue', icon: '🎓', color: '#22c55e' },
  other: { label: 'Autre', icon: '📝', color: '#94A3B8' },
} as const;

export type ExpenseCategory = keyof typeof EXPENSE_CATEGORIES;

// ─── EXPENSE RECORD ───
export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  tvaDeductible: boolean;    // Peut-on récupérer la TVA ?
  tvaRate: number;           // Taux TVA (20%, 10%, 5.5%, 0%)
  tvaAmount: number;         // Montant TVA calculé
  receiptPhoto?: string;     // Base64 du justificatif (photo caméra)
  receiptFileName?: string;  // Nom du fichier justificatif
  notes?: string;
  createdAt: string;
}

// ─── MILEAGE LOG (Suivi Kilométrique) ───
export interface MileageLog {
  id: string;
  date: string;
  startKm: number;
  endKm: number;
  distance: number;           // endKm - startKm
  purpose: 'professional' | 'personal';
  description: string;
  tripId?: string;            // Lien optionnel vers une course
  createdAt: string;
}

// ─── BARÈME URSSAF INDEMNITÉS KILOMÉTRIQUES 2025 ───
// Pour véhicules personnels utilisés à titre professionnel
// Source: barème officiel URSSAF (3 à 7 CV fiscaux)
export const URSSAF_MILEAGE_SCALE_2025 = {
  '3cv': { upTo5000: 0.529, from5001To20000: { d: 0.316, fixed: 1065 }, above20000: 0.370 },
  '4cv': { upTo5000: 0.606, from5001To20000: { d: 0.340, fixed: 1330 }, above20000: 0.407 },
  '5cv': { upTo5000: 0.636, from5001To20000: { d: 0.357, fixed: 1395 }, above20000: 0.427 },
  '6cv': { upTo5000: 0.665, from5001To20000: { d: 0.374, fixed: 1457 }, above20000: 0.447 },
  '7cv+': { upTo5000: 0.697, from5001To20000: { d: 0.394, fixed: 1515 }, above20000: 0.470 },
} as const;

export type FiscalPower = keyof typeof URSSAF_MILEAGE_SCALE_2025;

/**
 * Calcule l'indemnité kilométrique URSSAF annuelle
 * @param totalKm - Total km professionnels dans l'année
 * @param fiscalPower - Puissance fiscale du véhicule
 * @returns Montant de l'indemnité en euros
 */
export function calculateMileageAllowance(totalKm: number, fiscalPower: FiscalPower): number {
  const scale = URSSAF_MILEAGE_SCALE_2025[fiscalPower];
  if (totalKm <= 5000) {
    return totalKm * scale.upTo5000;
  } else if (totalKm <= 20000) {
    return totalKm * scale.from5001To20000.d + scale.from5001To20000.fixed;
  } else {
    return totalKm * scale.above20000;
  }
}
