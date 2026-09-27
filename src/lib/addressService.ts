export interface AddressFeature {
  label: string;
  name: string;
  postcode: string;
  city: string;
  context: string;
}

export async function searchFrenchAddresses(query: string): Promise<AddressFeature[]> {
  if (!query || query.trim().length < 3) return [];
  try {
    const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.features) return [];
    return data.features.map((f: any) => ({
      label: f.properties.label || '',
      name: f.properties.name || '',
      postcode: f.properties.postcode || '',
      city: f.properties.city || '',
      context: f.properties.context || '',
    }));
  } catch (err) {
    console.warn('Address autocomplete network error:', err);
    return [];
  }
}
