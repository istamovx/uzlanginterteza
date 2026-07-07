import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, TYPE_LABELS, type EntrySummary } from "../api";

export default function SearchBox({ autoFocus = false }: { autoFocus?: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EntrySummary[]>([]);
  const [suggestions, setSuggestions] = useState<EntrySummary[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      api
        .search(q, 7)
        .then((r) => {
          setResults(r.results);
          setSuggestions(r.suggestions);
          setOpen(true);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = () => {
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    navigate(`/katalog?q=${encodeURIComponent(q)}`);
  };

  const shown = results.length > 0 ? results : suggestions;

  return (
    <div ref={boxRef} className="relative w-full">
      <div className="flex items-center gap-2 rounded-full border border-soft-200 bg-white-0 px-5 py-3 shadow-sm transition-shadow focus-within:border-primary focus-within:shadow-md">
        <svg
          className="h-5 w-5 shrink-0 text-soft"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
          />
        </svg>
        <input
          type="search"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          onFocus={() => shown.length > 0 && setOpen(true)}
          placeholder="So'z yoki iqtibosni qidiring… (masalan: Navoiy)"
          className="w-full bg-transparent outline-none placeholder:text-soft"
          aria-label="Qidiruv"
        />
        {loading && (
          <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-soft-200 border-t-primary" />
        )}
      </div>

      {open && shown.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-30 mt-2 max-h-96 overflow-auto rounded-2xl border border-soft-200 bg-white-0 py-2 shadow-lg">
          {results.length === 0 && (
            <li className="px-5 py-2 text-sub">Balki bularni izlagandirsiz:</li>
          )}
          {shown.map((r) => (
            <li key={r.id}>
              <Link
                to={`/birlik/${r.id}`}
                onClick={() => setOpen(false)}
                className="flex flex-col gap-0.5 px-5 py-2.5 hover:bg-weak-50"
              >
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-medium">{r.unit}</span>
                  <span className="text-sub">{TYPE_LABELS[r.type]}</span>
                </span>
                <span className="line-clamp-1 text-sub">{r.contextText}</span>
              </Link>
            </li>
          ))}
          <li className="border-t border-soft-200 pt-1">
            <button
              onClick={submit}
              className="w-full px-5 py-2 text-left font-medium text-primary hover:bg-weak-50"
            >
              Barcha natijalarni ko'rish →
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
