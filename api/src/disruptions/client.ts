export interface Disruption {
  id: string;
  title: string;
  body: string;
  severity: 'low' | 'medium' | 'high';
  modality: string;
  area: string;
  until: string | null;
  affectsRoutes: string[];
}

export async function fetchDisruptions(): Promise<Disruption[]> {
  return [];
}
