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
  aiProvider?: 'openai' | 'anthropic' | 'gemini';
  geminiApiKey?: string;
  vehicleOwnership: 'personal' | 'company';
  fiscalPower?: FiscalPower;
}

// ─── LEGAL DOCUMENT (VAULT & CONTRÔLE ROUTIER) ───
export interface LegalDocument {
  id: string;
  name: string;
  category: 'driver' | 'vehicle' | 'admin';
  scope: 'road_control' | 'platform_compliance';
  legalBasis?: string;
  description?: string;
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
  companyName: '',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  siret: '',
  siren: '',
  registreVTC: '',
  driverName: '',
  driverCardNumber: '',
  driverPhone: '',
  vehiclePlate: '',
  vehicleModel: '',
  welcomeMessage: 'BIENVENUE / WELCOME',
  logoColor: '#3B82F6',
  tvaRegime: 'franchise',
  tvaRate: 10,
  tvaNumber: '',
  aiProvider: 'gemini',
  geminiApiKey: '',
  vehicleOwnership: 'company',
  fiscalPower: '5cv'
};

export const LEGAL_DOC_TEMPLATES: Omit<LegalDocument, 'id'>[] = [
  // ── 🚨 1. PIÈCES OBLIGATOIRES À BORD (Contrôle Routier Police, Gendarmerie, Boers) ──
  {
    name: 'Carte Professionnelle VTC (Physique)',
    category: 'driver',
    scope: 'road_control',
    legalBasis: 'Art. L. 3120-2-1 Code des transports',
    description: 'Carte physique sécurisée apposée de manière visible sur le pare-brise.',
    isRequired: true,
  },
  {
    name: 'Permis de Conduire (Catégorie B)',
    category: 'driver',
    scope: 'road_control',
    legalBasis: 'Art. R. 221-1 Code de la route',
    description: 'Permis de conduire valide pour la conduite de véhicules légers.',
    isRequired: true,
  },
  {
    name: 'Certificat d\'Immatriculation (Carte Grise)',
    category: 'vehicle',
    scope: 'road_control',
    legalBasis: 'Art. R. 322-1 Code de la route',
    description: 'Carte grise originale ou contrat de location/leasing au nom de l\'exploitant.',
    isRequired: true,
  },
  {
    name: 'Assurance RC Circulation - Transport de Personnes à Titre Onéreux (TPTI)',
    category: 'vehicle',
    scope: 'road_control',
    legalBasis: 'Art. L. 211-1 Code des assurances & TPTI',
    description: 'Attestation mentionnant expressément la couverture transport public de personnes à titre onéreux.',
    isRequired: true,
  },
  {
    name: 'Assurance RC Professionnelle Exploitation VTC',
    category: 'vehicle',
    scope: 'road_control',
    legalBasis: 'Art. L. 3120-4 Code des transports',
    description: 'Assurance Responsabilité Civile Professionnelle obligatoire pour l\'activité VTC.',
    isRequired: true,
  },
  {
    name: 'Contrôle Technique Périodique VTC Annuel',
    category: 'vehicle',
    scope: 'road_control',
    legalBasis: 'Arrêté du 18 juin 1991 (CT annuel)',
    description: 'Contrôle technique spécifique VTC obligatoire dès le 1er anniversaire du véhicule.',
    isRequired: true,
  },
  {
    name: 'Attestation Inscription Registre VTC (REVTC) & Macarons',
    category: 'vehicle',
    scope: 'road_control',
    legalBasis: 'Art. R. 3122-1 Code des transports',
    description: 'Numéro EVTC actif + macarons rouge/or apposés à l\'avant gauche et à l\'arrière droit.',
    isRequired: true,
  },
  {
    name: 'Vignette Crit\'Air (Contexte ZFE-m uniquement)',
    category: 'vehicle',
    scope: 'road_control',
    legalBasis: 'Art. L. 318-1 Code de la route',
    description: 'Exigible uniquement dans les agglomérations soumises à une Zone à Faibles Émissions active.',
    isRequired: false,
  },

  // ── 🏢 2. DOSSIER CONFORMITÉ ENTREPRISE & PLATEFORMES (Non requis en contrôle routier) ──
  {
    name: 'Extrait Kbis ou Avis de Situation SIRENE (RCS)',
    category: 'admin',
    scope: 'platform_compliance',
    legalBasis: 'RCS / Code de commerce (Dossier entreprise & banques)',
    description: 'Preuve d\'existence de la société. Aucune obligation de détention physique dans l\'habitacle.',
    isRequired: false,
  },
  {
    name: 'Attestation de Vigilance URSSAF (Travail Dissimulé)',
    category: 'admin',
    scope: 'platform_compliance',
    legalBasis: 'Art. L. 8222-1 Code du travail (Lutte travail dissimulé)',
    description: 'Exigée tous les 6 mois par Uber, Bolt, donneurs d\'ordres B2B et plateformes partenaires.',
    isRequired: false,
  },
  {
    name: 'Attestation de Régularité Fiscale (DGFIP)',
    category: 'admin',
    scope: 'platform_compliance',
    legalBasis: 'Conformité fiscale annuelle entreprise',
    description: 'Attestation d\'acquittement de la TVA et de l\'IS pour comptes entreprise et marchés.',
    isRequired: false,
  },
  {
    name: 'Attestation de Formation Continue (14 heures)',
    category: 'driver',
    scope: 'platform_compliance',
    legalBasis: 'Arrêté du 11 août 2017 (Renouvellement quinquennal préfecture)',
    description: 'À fournir à la préfecture tous les 5 ans pour renouveler la carte pro. Non exigible au volant.',
    isRequired: false,
  },
  {
    name: 'Avis Médical d\'Aptitude Physique Préfectorale',
    category: 'driver',
    scope: 'platform_compliance',
    legalBasis: 'CERFA préfecture délivré par médecin agréé',
    description: 'Dossier préfectoral d\'aptitude médicale pour délivrance de carte pro (secret médical / non exigible en contrôle).',
    isRequired: false,
  },
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
