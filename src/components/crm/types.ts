import { User, Hotel, Briefcase, MapPin, Star, Building2 } from 'lucide-react';

export interface Contact {
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
  /** Soft delete : date de suppression (ISO). Le contact est masqué mais conservé. */
  deletedAt?: string | null;
  /** Nombre de courses au moment de la suppression : si une nouvelle course arrive, le contact réapparaît. */
  tripsAtDeletion?: number;
}

export const CATEGORIES = {
  particulier: { label: 'Particulier', icon: User, color: '#3b82f6' },
  hotel: { label: 'Hôtel / Concierge', icon: Hotel, color: '#8b5cf6' },
  entreprise: { label: 'Entreprise', icon: Briefcase, color: '#22c55e' },
  agence: { label: 'Agence de voyage', icon: MapPin, color: '#f59e0b' },
  concierge: { label: 'Concierge privé', icon: Star, color: '#ec4899' },
  restaurant: { label: 'Restaurant / Club', icon: Building2, color: '#ef4444' },
} as const;

/** Clé de rapprochement contact ↔ courses (identique pour les contacts manuels et ceux issus des courses). */
export const contactKey = (c: { phone?: string; email?: string; id: string }) => c.phone || c.email || c.id;
export const tripContactKey = (t: { clientPhone?: string; clientEmail?: string; clientName: string }) =>
  t.clientPhone || t.clientEmail || t.clientName;
