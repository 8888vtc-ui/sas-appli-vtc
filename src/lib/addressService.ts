export interface AddressFeature {
  label: string;
  name: string;
  postcode: string;
  city: string;
  context: string;
  lat?: number;
  lon?: number;
}

// Liste locale des POI majeurs
const MAJOR_POIS: AddressFeature[] = [
  { label: "Aéroport Nice Côte d'Azur - Terminal 1, 06200 Nice", name: "Aéroport Nice Côte d'Azur - Terminal 1", postcode: "06200", city: "Nice", context: "06, Alpes-Maritimes", lat: 43.658, lon: 7.215 },
  { label: "Aéroport Nice Côte d'Azur - Terminal 2, 06200 Nice", name: "Aéroport Nice Côte d'Azur - Terminal 2", postcode: "06200", city: "Nice", context: "06, Alpes-Maritimes", lat: 43.660, lon: 7.202 },
  { label: "Aéroport Nice Côte d'Azur - Aviation Générale, 06200 Nice", name: "Aéroport Nice Côte d'Azur - Aviation Générale (Privé)", postcode: "06200", city: "Nice", context: "06, Alpes-Maritimes", lat: 43.662, lon: 7.210 },
  { label: "Gare SNCF Nice-Ville (Thiers), 06000 Nice", name: "Gare SNCF Nice-Ville (Thiers)", postcode: "06000", city: "Nice", context: "06, Alpes-Maritimes", lat: 43.704, lon: 7.261 },
  { label: "Gare SNCF de Cannes, 06400 Cannes", name: "Gare SNCF de Cannes", postcode: "06400", city: "Cannes", context: "06, Alpes-Maritimes", lat: 43.553, lon: 7.020 },
  { label: "Gare SNCF d'Antibes, 06600 Antibes", name: "Gare SNCF d'Antibes", postcode: "06600", city: "Antibes", context: "06, Alpes-Maritimes", lat: 43.585, lon: 7.119 },
  { label: "Aéroport de Paris-Charles-de-Gaulle (CDG), 95700 Roissy-en-France", name: "Aéroport Paris CDG", postcode: "95700", city: "Roissy", context: "95, Val-d'Oise", lat: 49.009, lon: 2.547 },
  { label: "Aéroport de Paris-Orly (ORY), 94390 Orly", name: "Aéroport Paris Orly", postcode: "94390", city: "Orly", context: "94, Val-de-Marne", lat: 48.726, lon: 2.365 },
  { label: "Gare de Lyon, 75012 Paris", name: "Gare de Lyon", postcode: "75012", city: "Paris", context: "75, Paris", lat: 48.844, lon: 2.374 },
  { label: "Gare du Nord, 75010 Paris", name: "Gare du Nord", postcode: "75010", city: "Paris", context: "75, Paris", lat: 48.880, lon: 2.355 },
  { label: "Gare Montparnasse, 75015 Paris", name: "Gare Montparnasse", postcode: "75015", city: "Paris", context: "75, Paris", lat: 48.841, lon: 2.318 },
  { label: "Aéroport Marseille Provence, 13727 Marignane", name: "Aéroport Marseille Provence (MRS)", postcode: "13727", city: "Marignane", context: "13, Bouches-du-Rhône", lat: 43.438, lon: 5.214 },
  { label: "Gare Saint-Charles, 13001 Marseille", name: "Gare Marseille Saint-Charles", postcode: "13001", city: "Marseille", context: "13, Bouches-du-Rhône", lat: 43.302, lon: 5.380 },
  { label: "Aéroport Lyon-Saint Exupéry (LYS), 69125 Colombier-Saugnieu", name: "Aéroport Lyon-Saint Exupéry", postcode: "69125", city: "Lyon", context: "69, Rhône", lat: 45.726, lon: 5.080 }
];

export async function searchFrenchAddresses(query: string, signal?: AbortSignal): Promise<AddressFeature[]> {
  if (!query || query.trim().length < 3) return [];
  
  const q = query.toLowerCase();
  
  // 1. Filtrer les POI locaux
  const localMatches = MAJOR_POIS.filter(poi => 
    poi.label.toLowerCase().includes(q) || poi.name.toLowerCase().includes(q)
  );

  // 2. Interroger l'API Photon (Komoot)
  // Biais géographique sur la Côte d'Azur: lat=43.7, lon=7.2, et limites pour la France
  let apiResults: AddressFeature[] = [];
  try {
    // bbox approximative France métropolitaine : -5.14, 41.33, 9.56, 51.09
    const bbox = '-5.14,41.33,9.56,51.09';
    // Biais vers Nice/Cannes
    const lat = 43.7;
    const lon = 7.2;
    
    const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${lat}&lon=${lon}&bbox=${bbox}&limit=5&lang=fr`, {
      signal
    });

    if (res.ok) {
      const data = await res.json();
      if (data.features) {
        apiResults = data.features.map((f: any) => {
          const props = f.properties;
          const coords = f.geometry.coordinates; // [lon, lat]
          
          let name = props.name || props.street || '';
          if (props.housenumber && props.street) {
            name = `${props.housenumber} ${props.street}`;
          }
          
          const city = props.city || props.town || props.village || '';
          const postcode = props.postcode || '';
          const label = [name, postcode, city].filter(Boolean).join(', ');
          
          return {
            label: label,
            name: name,
            postcode: postcode,
            city: city,
            context: props.state || '',
            lat: coords ? coords[1] : undefined,
            lon: coords ? coords[0] : undefined,
          };
        });
        
        // Remove empty or duplicate labels
        apiResults = apiResults.filter((v, i, a) => v.label && a.findIndex(t => t.label === v.label) === i);
      }
    }
  } catch (err: any) {
    if (err.name !== 'AbortError') {
      console.warn('Address autocomplete network error:', err);
    }
  }

  // 3. Fusionner les résultats (POI en premier)
  return [...localMatches, ...apiResults].slice(0, 8);
}
