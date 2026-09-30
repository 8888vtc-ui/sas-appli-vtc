export interface AddressFeature {
  label: string;
  name: string;
  postcode: string;
  city: string;
  context: string;
}

// Liste locale des POI majeurs car l'API du Gouvernement (BAN) gère mal les "lieux-dits" et aéroports
const MAJOR_POIS: AddressFeature[] = [
  { label: "Aéroport Nice Côte d'Azur - Terminal 1, 06200 Nice", name: "Aéroport Nice Côte d'Azur - Terminal 1", postcode: "06200", city: "Nice", context: "06, Alpes-Maritimes" },
  { label: "Aéroport Nice Côte d'Azur - Terminal 2, 06200 Nice", name: "Aéroport Nice Côte d'Azur - Terminal 2", postcode: "06200", city: "Nice", context: "06, Alpes-Maritimes" },
  { label: "Aéroport Nice Côte d'Azur - Aviation Générale, 06200 Nice", name: "Aéroport Nice Côte d'Azur - Aviation Générale (Privé)", postcode: "06200", city: "Nice", context: "06, Alpes-Maritimes" },
  { label: "Gare SNCF Nice-Ville (Thiers), 06000 Nice", name: "Gare SNCF Nice-Ville (Thiers)", postcode: "06000", city: "Nice", context: "06, Alpes-Maritimes" },
  { label: "Gare SNCF de Cannes, 06400 Cannes", name: "Gare SNCF de Cannes", postcode: "06400", city: "Cannes", context: "06, Alpes-Maritimes" },
  { label: "Gare SNCF d'Antibes, 06600 Antibes", name: "Gare SNCF d'Antibes", postcode: "06600", city: "Antibes", context: "06, Alpes-Maritimes" },
  { label: "Aéroport de Paris-Charles-de-Gaulle (CDG), 95700 Roissy-en-France", name: "Aéroport Paris CDG", postcode: "95700", city: "Roissy", context: "95, Val-d'Oise" },
  { label: "Aéroport de Paris-Orly (ORY), 94390 Orly", name: "Aéroport Paris Orly", postcode: "94390", city: "Orly", context: "94, Val-de-Marne" },
  { label: "Gare de Lyon, 75012 Paris", name: "Gare de Lyon", postcode: "75012", city: "Paris", context: "75, Paris" },
  { label: "Gare du Nord, 75010 Paris", name: "Gare du Nord", postcode: "75010", city: "Paris", context: "75, Paris" },
  { label: "Gare Montparnasse, 75015 Paris", name: "Gare Montparnasse", postcode: "75015", city: "Paris", context: "75, Paris" },
  { label: "Aéroport Marseille Provence, 13727 Marignane", name: "Aéroport Marseille Provence (MRS)", postcode: "13727", city: "Marignane", context: "13, Bouches-du-Rhône" },
  { label: "Gare Saint-Charles, 13001 Marseille", name: "Gare Marseille Saint-Charles", postcode: "13001", city: "Marseille", context: "13, Bouches-du-Rhône" },
  { label: "Aéroport Lyon-Saint Exupéry (LYS), 69125 Colombier-Saugnieu", name: "Aéroport Lyon-Saint Exupéry", postcode: "69125", city: "Lyon", context: "69, Rhône" }
];

export async function searchFrenchAddresses(query: string): Promise<AddressFeature[]> {
  if (!query || query.trim().length < 3) return [];
  
  const q = query.toLowerCase();
  
  // 1. Filtrer les POI locaux
  const localMatches = MAJOR_POIS.filter(poi => 
    poi.label.toLowerCase().includes(q) || poi.name.toLowerCase().includes(q)
  );

  // 2. Interroger l'API du Gouvernement
  let apiResults: AddressFeature[] = [];
  try {
    const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`);
    if (res.ok) {
      const data = await res.json();
      if (data.features) {
        apiResults = data.features.map((f: any) => ({
          label: f.properties.label || '',
          name: f.properties.name || '',
          postcode: f.properties.postcode || '',
          city: f.properties.city || '',
          context: f.properties.context || '',
        }));
      }
    }
  } catch (err) {
    console.warn('Address autocomplete network error:', err);
  }

  // 3. Fusionner les résultats (POI en premier)
  return [...localMatches, ...apiResults].slice(0, 8);
}
