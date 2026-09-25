import type { CompanyDriver } from '../types';

export interface LocalCompany {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  siret?: string;
  siren?: string;
  registre_vtc?: string;
  tva_regime?: 'franchise' | 'assujetti';
  tva_number?: string;
  welcome_message?: string;
  logo_color?: string;
}

export interface LocalProfile {
  id: string;
  company_id: string;
  full_name: string;
  phone?: string;
  driver_card_number?: string;
  role: 'admin' | 'driver';
  email?: string;
  company?: LocalCompany;
}

export interface RegisteredAccount {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: 'admin' | 'driver';
  driverCardNumber?: string;
  company: LocalCompany;
  createdAt: string;
}

export const DEMO_COMPANY: LocalCompany = {
  id: 'comp-demo-01',
  name: 'AZUR PRESTIGE VTC',
  address: '15 Boulevard de la Croisette, 06400 Cannes',
  phone: '+33 4 93 00 11 22',
  email: 'contact@azur-prestige-vtc.fr',
  siret: '892 456 789 00015',
  siren: '892 456 789',
  registre_vtc: 'EVTC060240098',
  tva_regime: 'franchise',
  tva_number: '',
  welcome_message: 'BIENVENUE / WELCOME',
  logo_color: '#3B82F6',
};

export const DEMO_PROFILE: LocalProfile = {
  id: 'user-demo-01',
  company_id: 'comp-demo-01',
  full_name: 'Alexandre Martin',
  phone: '+33 6 12 34 56 78',
  driver_card_number: 'T-060-24-00128-V',
  role: 'admin',
  email: 'demo@vtc.pro',
  company: DEMO_COMPANY,
};

const USERS_STORAGE_KEY = 'vtc_users_database';
const ACTIVE_SESSION_KEY = 'vtc_active_session';
const PROFILE_KEY = 'vtc_local_profile';
const DRIVERS_STORAGE_KEY = 'vtc_company_drivers';

// Initialise les comptes stockés en local
export function getRegisteredAccounts(): RegisteredAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Récupère la session active
export function getActiveSession(): { user: { id: string; email: string }; profile: LocalProfile } | null {
  try {
    const rawSession = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (rawSession) {
      return JSON.parse(rawSession);
    }
    const rawProfile = localStorage.getItem(PROFILE_KEY);
    if (rawProfile) {
      const parsed = JSON.parse(rawProfile);
      return {
        user: { id: parsed.id || 'usr-local', email: parsed.company?.email || parsed.email || 'chauffeur@vtc.pro' },
        profile: parsed,
      };
    }
    return null;
  } catch {
    return null;
  }
}

// Sauvegarde la session active
export function saveActiveSession(user: { id: string; email?: string }, profile: LocalProfile) {
  const cleanUser = { id: user.id, email: user.email || '' };
  const session = { user: cleanUser, profile };
  localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

  // Met à jour les paramètres de la société
  if (profile.company) {
    const s = profile.company;
    const existingSettingsRaw = localStorage.getItem('vtc_settings');
    const existing = existingSettingsRaw ? JSON.parse(existingSettingsRaw) : {};
    const updated = {
      ...existing,
      companyName: s.name || existing.companyName || 'MON ENTREPRISE VTC',
      companyAddress: s.address || existing.companyAddress || '',
      companyPhone: s.phone || existing.companyPhone || '',
      companyEmail: s.email || existing.companyEmail || '',
      siret: s.siret || existing.siret || '',
      siren: s.siren || s.siret?.slice(0, 9) || existing.siren || '',
      registreVTC: s.registre_vtc || existing.registreVTC || '',
      tvaRegime: s.tva_regime || existing.tvaRegime || 'franchise',
      driverName: profile.full_name || existing.driverName || '',
      driverPhone: profile.phone || existing.driverPhone || '',
      driverCardNumber: profile.driver_card_number || existing.driverCardNumber || '',
    };
    localStorage.setItem('vtc_settings', JSON.stringify(updated));
  }
}

// Inscription d'un nouvel utilisateur / société en local
export function registerLocalAccount(data: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  companyName: string;
  registreVTC: string;
  siret: string;
  address: string;
  tvaRegime: 'franchise' | 'assujetti';
  driverCardNumber?: string;
}): { success: boolean; user?: { id: string; email: string }; profile?: LocalProfile; error?: string } {
  try {
    const accounts = getRegisteredAccounts();
    const cleanEmail = data.email.trim().toLowerCase();

    // Vérifie si l'email existe déjà
    if (accounts.some(a => a.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        error: 'Un compte avec cet email existe déjà. Veuillez vous connecter.',
      };
    }

    const companyId = 'comp-' + Date.now();
    const userId = 'usr-' + Date.now();

    const company: LocalCompany = {
      id: companyId,
      name: data.companyName.trim(),
      address: data.address.trim(),
      phone: data.phone.trim(),
      email: cleanEmail,
      siret: data.siret.trim(),
      siren: data.siret.trim().replace(/\s+/g, '').slice(0, 9),
      registre_vtc: data.registreVTC.trim(),
      tva_regime: data.tvaRegime,
      welcome_message: 'BIENVENUE / WELCOME',
      logo_color: '#3B82F6',
    };

    const profile: LocalProfile = {
      id: userId,
      company_id: companyId,
      full_name: data.fullName.trim(),
      phone: data.phone.trim(),
      driver_card_number: data.driverCardNumber || '',
      role: 'admin',
      email: cleanEmail,
      company,
    };

    const newAccount: RegisteredAccount = {
      id: userId,
      email: cleanEmail,
      password: data.password,
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      role: 'admin',
      driverCardNumber: data.driverCardNumber || '',
      company,
      createdAt: new Date().toISOString(),
    };

    // Sauvegarde dans la base locale
    accounts.push(newAccount);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(accounts));

    // Ajoute aussi comme chauffeur dans l'équipe
    addCompanyDriver({
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      email: cleanEmail,
      driverCardNumber: data.driverCardNumber || '',
      role: 'admin',
      status: 'active',
    });

    const user = { id: userId, email: cleanEmail };
    saveActiveSession(user, profile);

    return { success: true, user, profile };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Erreur lors de la création du compte en local.',
    };
  }
}

// Connexion locale
export function loginLocalAccount(
  emailInput: string,
  passwordInput: string
): { success: boolean; user?: { id: string; email: string }; profile?: LocalProfile; error?: string } {
  const cleanEmail = emailInput.trim().toLowerCase();

  // 1. Vérification compte démo
  if (
    cleanEmail === 'demo@vtc.pro' ||
    cleanEmail === 'alexandre.martin@azur-prestige-vtc.fr' ||
    cleanEmail === 'demo'
  ) {
    if (passwordInput === 'demo' || passwordInput === 'demo123' || passwordInput === '123456' || passwordInput === '') {
      return loginAsDemo();
    }
  }

  // 2. Recherche dans les comptes enregistrés
  const accounts = getRegisteredAccounts();
  const account = accounts.find(a => a.email.toLowerCase() === cleanEmail);

  if (!account) {
    return {
      success: false,
      error: 'Aucun compte trouvé avec cet email. Veuillez vérifier votre saisie ou vous inscrire.',
    };
  }

  if (account.password !== passwordInput) {
    return {
      success: false,
      error: 'Mot de passe incorrect.',
    };
  }

  const profile: LocalProfile = {
    id: account.id,
    company_id: account.company.id,
    full_name: account.fullName,
    phone: account.phone,
    driver_card_number: account.driverCardNumber,
    role: account.role,
    email: account.email,
    company: account.company,
  };

  const user = { id: account.id, email: account.email };
  saveActiveSession(user, profile);

  return { success: true, user, profile };
}

// Connexion rapide au compte Démo
export function loginAsDemo(): {
  success: boolean;
  user: { id: string; email: string };
  profile: LocalProfile;
} {
  const user = { id: DEMO_PROFILE.id, email: DEMO_PROFILE.email || 'demo@vtc.pro' };
  saveActiveSession(user, DEMO_PROFILE);
  return { success: true, user, profile: DEMO_PROFILE };
}

// Déconnexion
export function clearActiveSession() {
  localStorage.removeItem(ACTIVE_SESSION_KEY);
  localStorage.removeItem(PROFILE_KEY);
}

// ─── GESTION DES CHAUFFEURS DE L'ÉQUIPE ───

export function getCompanyDrivers(): CompanyDriver[] {
  try {
    const raw = localStorage.getItem(DRIVERS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);

    // Initialise avec le chauffeur principal actuel si disponible
    const session = getActiveSession();
    if (session) {
      const initial: CompanyDriver[] = [
        {
          id: session.user.id || 'drv-1',
          fullName: session.profile.full_name || 'Chauffeur Principal',
          phone: session.profile.phone || '',
          email: session.user.email || '',
          driverCardNumber: session.profile.driver_card_number || 'T-060-XXXXXXXX-X',
          role: session.profile.role || 'admin',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return [];
  } catch {
    return [];
  }
}

export function addCompanyDriver(driverData: Omit<CompanyDriver, 'id' | 'createdAt'>): CompanyDriver {
  const drivers = getCompanyDrivers();
  const newDriver: CompanyDriver = {
    ...driverData,
    id: 'drv-' + Date.now(),
    createdAt: new Date().toISOString(),
  };
  drivers.push(newDriver);
  localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(drivers));
  return newDriver;
}

export function updateCompanyDriver(id: string, updates: Partial<CompanyDriver>): CompanyDriver | null {
  const drivers = getCompanyDrivers();
  const idx = drivers.findIndex(d => d.id === id);
  if (idx === -1) return null;
  drivers[idx] = { ...drivers[idx], ...updates };
  localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(drivers));
  return drivers[idx];
}

export function deleteCompanyDriver(id: string): boolean {
  const drivers = getCompanyDrivers();
  const filtered = drivers.filter(d => d.id !== id);
  localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(filtered));
  return true;
}
