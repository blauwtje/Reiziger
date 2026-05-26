export interface AddressHit {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
}

export async function geocodeNL(query: string): Promise<AddressHit[]> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('countrycodes', 'nl');
  url.searchParams.set('limit', '5');
  const r = await fetch(url.toString(), {
    headers: { 'User-Agent': 'Reiziger/0.1 (personal-planner)' },
  });
  if (!r.ok) return [];
  const data = await r.json() as Array<{ display_name: string; lat: string; lon: string }>;
  return data.map((d) => ({
    name: d.display_name.split(',')[0].trim(),
    displayName: d.display_name,
    lat: Number(d.lat),
    lon: Number(d.lon),
  }));
}
