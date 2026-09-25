import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Détection robuste du mode local / non configuré
const isPlaceholder = (str: string) => {
  const s = str.toLowerCase();
  return (
    !s ||
    s.includes('votre') ||
    s.includes('projet_id') ||
    s.includes('example') ||
    s.includes('cle_anonyme') ||
    s.includes('anon_key')
  );
};

export const isLocalMode = isPlaceholder(rawUrl) || isPlaceholder(rawKey) || rawKey.length < 25;

export const supabase = !isLocalMode
  ? createClient(rawUrl, rawKey)
  : (null as any);

/** 
 * SCHÉMA DE LA BASE DE DONNÉES (À exécuter dans l'éditeur SQL de Supabase si vous activez le Cloud) :
 * 
 * -- 1. Table des Sociétés
 * CREATE TABLE companies (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   name TEXT NOT NULL,
 *   address TEXT,
 *   phone TEXT,
 *   email TEXT,
 *   siret TEXT,
 *   siren TEXT,
 *   registre_vtc TEXT,
 *   tva_regime TEXT DEFAULT 'franchise',
 *   tva_number TEXT,
 *   welcome_message TEXT DEFAULT 'BIENVENUE',
 *   logo_color TEXT DEFAULT '#FFD700',
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- 2. Table des Profils (Chauffeurs)
 * CREATE TABLE profiles (
 *   id UUID PRIMARY KEY REFERENCES auth.users(id),
 *   company_id UUID REFERENCES companies(id),
 *   full_name TEXT,
 *   phone TEXT,
 *   driver_card_number TEXT,
 *   role TEXT DEFAULT 'driver',
 *   avatar_url TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- 3. Table des Courses (Trips)
 * CREATE TABLE trips (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   company_id UUID REFERENCES companies(id),
 *   chauffeur_id UUID REFERENCES profiles(id),
 *   client_name TEXT NOT NULL,
 *   client_phone TEXT,
 *   client_email TEXT,
 *   pickup_location TEXT NOT NULL,
 *   dropoff_location TEXT,
 *   date DATE NOT NULL,
 *   time TIME NOT NULL,
 *   booking_datetime TEXT,
 *   flight_number TEXT,
 *   passenger_count INTEGER DEFAULT 1,
 *   price DECIMAL(10,2) NOT NULL,
 *   trip_type TEXT DEFAULT 'transfer',
 *   status TEXT DEFAULT 'scheduled',
 *   invoice_number TEXT,
 *   notes TEXT,
 *   signature TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- 4. Table des Documents (Vault)
 * CREATE TABLE documents (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   company_id UUID REFERENCES companies(id),
 *   name TEXT NOT NULL,
 *   category TEXT NOT NULL,
 *   expiry_date DATE,
 *   file_url TEXT,
 *   is_required BOOLEAN DEFAULT true,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- 5. Table des Factures
 * CREATE TABLE invoices (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   company_id UUID REFERENCES companies(id),
 *   trip_id UUID REFERENCES trips(id),
 *   invoice_number TEXT NOT NULL UNIQUE,
 *   amount DECIMAL(10,2) NOT NULL,
 *   tva_amount DECIMAL(10,2) NOT NULL,
 *   total_ttc DECIMAL(10,2) NOT NULL,
 *   status TEXT DEFAULT 'pending',
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- 6. Table des Dépenses
 * CREATE TABLE expenses (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   company_id UUID REFERENCES companies(id),
 *   description TEXT NOT NULL,
 *   amount DECIMAL(10,2) NOT NULL,
 *   category TEXT NOT NULL,
 *   date DATE NOT NULL,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 */
