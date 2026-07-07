import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, TYPE_LABELS, type EntrySummary, type EntryType, type Filters } from "../api";
import EntryCard from "../components/EntryCard";
import Select from "../components/Select";

const PAGE_SIZE = 24;

const FILTER_DEFS = [
  { key: "semantic_field", label: "Semantik maydon", facet: "semanticFields" },
  { key: "hypernym", label: "Giperonim", facet: "hypernyms" },
  { key: "work", label: "Asar", facet: "works" },
  { key: "recognition", label: "Tanilish darajasi", facet: "recognitions" },
] as const;

export default function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters | null>(null);
  const [items, setItems] = useState<EntrySummary[]>([]);
  const [suggestions, setSuggestions] = useState<EntrySummary[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  const q = params.get("q") ?? "";

  useEffect(() => {
    api.filters().then(setFilters).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setSuggestions([]);
    if (q) {
      api
        .search(q, 50)
        .then((r) => {
          setItems(r.results);
          setSuggestions(r.suggestions);
          setTotal(r.results.length);
        })
        .finally(() => setLoading(false));
    } else {
      const query = new URLSearchParams();
      for (const key of ["type", "semantic_field", "hypernym", "recognition", "work", "letter"]) {
        const v = params.get(key);
        if (v) query.set(key, v);
      }
      query.set("limit", String(limit));
      api
        .entries(query)
        .then((r) => {
          setItems(r.items);
          setTotal(r.total);
        })
        .finally(() => setLoading(false));
    }
  }, [params, limit, q]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("q");
    setLimit(PAGE_SIZE);
    setParams(next, { replace: true });
  };

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    if (q) chips.push({ key: "q", label: `Qidiruv: "${q}"` });
    const type = params.get("type");
    if (type) chips.push({ key: "type", label: TYPE_LABELS[type as keyof typeof TYPE_LABELS] ?? type });
    for (const def of FILTER_DEFS) {
      const v = params.get(def.key);
      if (v) chips.push({ key: def.key, label: v });
    }
    const letter = params.get("letter");
    if (letter) chips.push({ key: "letter", label: `Harf: ${letter}` });
    return chips;
  }, [params, q]);

  return (
    <div className="flex flex-col gap-6 py-2">
      <h1 className="font-display text-[clamp(24px,4vw,32px)] font-semibold">
        Katalog
      </h1>

      {/* Filtrlar paneli */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Select
          label="Turi"
          value={params.get("type") ?? ""}
          onChange={(v) => setFilter("type", v)}
          options={(
            filters?.types ?? [
              { value: "allyuziv-nom", count: undefined },
              { value: "iqtibos", count: undefined },
            ]
          ).map((t) => ({
            value: t.value,
            label: TYPE_LABELS[t.value as EntryType] ?? t.value,
            count: t.count,
          }))}
        />
        {filters &&
          FILTER_DEFS.map((def) => (
            <Select
              key={def.key}
              label={def.label}
              value={params.get(def.key) ?? ""}
              onChange={(v) => setFilter(def.key, v)}
              options={filters[def.facet].map((f) => ({
                value: f.value,
                label: f.value,
                count: f.count,
              }))}
            />
          ))}
      </div>

      {/* Faol filtrlar */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key, "")}
              className="flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 font-medium text-primary-darker hover:bg-primary-light/70"
            >
              {c.label} <span aria-hidden>×</span>
            </button>
          ))}
          <span className="text-sub">{total} ta natija</span>
        </div>
      )}

      {/* Natijalar */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Yuklanmoqda">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-2xl border border-soft-200 p-5">
              <div className="skeleton h-6 w-2/3" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
              <div className="flex gap-2 pt-1">
                <div className="skeleton h-6 w-24 rounded-full" />
                <div className="skeleton h-6 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((e) => (
              <EntryCard key={e.id} entry={e} />
            ))}
          </div>
          {!q && items.length < total && (
            <button
              onClick={() => setLimit((l) => l + PAGE_SIZE)}
              className="mx-auto rounded-full bg-primary px-6 py-2.5 font-medium text-white-0 hover:bg-primary-dark"
            >
              Ko'proq ko'rsatish ({items.length}/{total})
            </button>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-6 py-8 text-center">
          <p className="text-sub">Hech narsa topilmadi.</p>
          {suggestions.length > 0 && (
            <>
              <p className="font-medium">Balki bularni izlagandirsiz:</p>
              <div className="grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
                {suggestions.map((e) => (
                  <EntryCard key={e.id} entry={e} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
