export type EntryType = "allyuziv-nom" | "iqtibos";

export interface EntrySummary {
  id: string;
  type: EntryType;
  unit: string;
  semanticField: string;
  hypernym: string;
  recognition: string;
  work: string;
  contextText: string;
  isComplete: boolean;
  score?: number;
}

export interface SourceInfo {
  author: string;
  work: string;
  genre: string;
  publisher: string;
  period: string;
  description?: string;
}

export interface IntertextInfo {
  author: string;
  work: string;
  genre: string;
  year: string;
  publisher: string;
  page: string;
}

export interface SynonymLink {
  text: string;
  entryId: string | null;
}

export interface EntryDetail {
  id: string;
  type: EntryType;
  unit: string;
  pronunciations: string[];
  contextText: string;
  intertext: IntertextInfo;
  originalSource: SourceInfo & { description: string };
  recognition: string;
  commentary: string;
  semanticField: string;
  synonyms: string[];
  synonymsLinked: SynonymLink[];
  hypernym: string;
  hyponym: string;
  note: string;
  isComplete: boolean;
  related: EntrySummary[];
}

export interface FacetItem {
  value: string;
  count: number;
}

export interface Filters {
  types: FacetItem[];
  semanticFields: FacetItem[];
  hypernyms: FacetItem[];
  recognitions: FacetItem[];
  works: FacetItem[];
  letters: string[];
}

export interface SearchResponse {
  query: string;
  results: EntrySummary[];
  suggestions: EntrySummary[];
}

export interface EntriesResponse {
  total: number;
  items: EntrySummary[];
}

export interface Stats {
  total: number;
  byType: Record<EntryType, number>;
  byRecognition: Record<string, number>;
  complete: number;
  synonyms?: number;
  pronunciations?: number;
}

export interface GraphNode {
  id: string;
  label: string;
  kind: "entry" | "hypernym";
  type?: EntryType;
  recognition?: string;
  count?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  kind: "hypernym" | "synonym";
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface AnalyzeMatch {
  start: number;
  end: number;
  entryId: string;
  unit: string;
  type: EntryType;
}

export interface AnalyzeResult {
  matches: AnalyzeMatch[];
  found: { entryId: string; unit: string; type: EntryType; count: number }[];
}

export interface ImportReport {
  imported: number;
  complete: number;
  warnings: string[];
  total: number;
  byType: Record<string, number>;
}

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API xatosi: ${res.status}`);
  return res.json();
}

export const api = {
  entries: (params: URLSearchParams) => getJSON<EntriesResponse>(`/api/entries?${params}`),
  entry: (id: string) => getJSON<EntryDetail>(`/api/entries/${id}`),
  search: (q: string, limit = 20) =>
    getJSON<SearchResponse>(`/api/search?q=${encodeURIComponent(q)}&limit=${limit}`),
  filters: () => getJSON<Filters>("/api/filters"),
  stats: () => getJSON<Stats>("/api/stats"),
  graph: () => getJSON<GraphData>("/api/graph"),

  analyze: async (text: string): Promise<AnalyzeResult> => {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`API xatosi: ${res.status}`);
    return res.json();
  },

  adminCheck: async (token: string): Promise<boolean> => {
    const res = await fetch("/api/admin/check", {
      headers: { "X-Admin-Token": token },
    });
    return res.ok;
  },

  adminImport: async (
    token: string,
    file: File,
    type: EntryType
  ): Promise<ImportReport> => {
    const form = new FormData();
    form.append("file", file);
    form.append("type", type);
    const res = await fetch("/api/admin/import", {
      method: "POST",
      headers: { "X-Admin-Token": token },
      body: form,
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(body?.detail ?? `Import xatosi: ${res.status}`);
    }
    return body as ImportReport;
  },
};

export const TYPE_LABELS: Record<EntryType, string> = {
  "allyuziv-nom": "Allyuziv nom",
  iqtibos: "Iqtibos",
};
