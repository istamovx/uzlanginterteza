import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, TYPE_LABELS, type EntrySummary, type Filters, type Stats } from "../api";
import SearchBox from "../components/SearchBox";
import StarOrnament from "../components/StarOrnament";
import Badge from "../components/Badge";

const CHIP_COLORS = [
  "#335cff",
  "#7d52f4",
  "#1fc16b",
  "#ff8447",
  "#fb4ba3",
  "#47c2ff",
  "#fb3748",
];

export default function HomePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [daily, setDaily] = useState<EntrySummary | null>(null);

  useEffect(() => {
    api
      .stats()
      .then((s) => {
        setStats(s);
        // Kun birligi: sana bo'yicha deterministik tanlanadi — har kuni yangisi
        const day = Math.floor(Date.now() / 86_400_000);
        const p = new URLSearchParams({ limit: "1", offset: String(day % s.total) });
        api.entries(p).then((r) => setDaily(r.items[0] ?? null)).catch(() => {});
      })
      .catch(() => {});
    api.filters().then(setFilters).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col gap-10 py-4 sm:gap-14 sm:py-10">
      {/* Hero + qidiruv */}
      <section className="relative mx-auto flex w-full max-w-2xl flex-col items-center gap-6 text-center">
        {/* Bezak fon: yumshoq nur */}
        <div className="pointer-events-none absolute inset-x-0 -top-12 bottom-0 -z-10" aria-hidden>
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-light/60 blur-3xl" />
        </div>

        <h1 className="anim-fade-up font-display text-[clamp(28px,6vw,48px)] font-semibold leading-tight tracking-tight">
          O'zbek intertekstual <span className="anim-gradient-text">tezaurusi</span>
        </h1>
        <p className="anim-fade-up anim-delay-100 max-w-xl text-lg text-sub">
          Ulug'bek Hamdam asarlaridagi allyuziv nomlar va iqtiboslarning kelib
          chiqishi, ma'nosi va semantik munosabatlari — bir joyda.
        </p>
        <div className="anim-fade-up anim-delay-200 w-full">
          <SearchBox autoFocus />
        </div>
      </section>

      {/* Kun birligi */}
      {daily && (
        <section className="anim-fade-up anim-delay-300">
          <Link
            to={`/birlik/${daily.id}`}
            className="group relative block overflow-hidden rounded-2xl border border-soft-200 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:p-8"
          >
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <div className="absolute inset-0 bg-gradient-to-br from-primary-light/60 via-transparent to-highlight-light/50" />
            </div>
            <div className="relative flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <StarOrnament className="h-4 w-4 text-primary" />
                <span className="font-medium uppercase tracking-wide text-primary">
                  Kun birligi
                </span>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="font-display text-[clamp(24px,4vw,34px)] font-semibold transition-colors group-hover:text-primary">
                  {daily.unit}
                </span>
                <Badge
                  variant={daily.type === "iqtibos" ? "type-iqtibos" : "type-allyuziv"}
                >
                  {TYPE_LABELS[daily.type]}
                </Badge>
              </div>
              {daily.contextText && (
                <p className="line-clamp-2 max-w-3xl italic text-sub">
                  «{daily.contextText}»
                </p>
              )}
              <span className="flex items-center gap-1.5 font-medium text-primary">
                Batafsil
                <svg
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </span>
            </div>
          </Link>
        </section>
      )}

      {/* Tur kartalari */}
      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/katalog?type=allyuziv-nom"
          className="group flex flex-col gap-2 rounded-2xl border border-soft-200 bg-primary-light/40 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 2 4 6v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-4zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
            </svg>
          </span>
          <span className="font-display text-xl font-semibold transition-colors group-hover:text-primary">
            Allyuziv nomlar
          </span>
          <span className="text-sub">
            Badiiy matnda boshqa asar, shaxs yoki voqeaga ishora qiluvchi nomlar
          </span>
          <span className="mt-2 flex items-end justify-between">
            <span className="font-display text-[clamp(28px,4vw,40px)] font-semibold leading-none text-primary">
              {stats?.byType["allyuziv-nom"] ?? "—"}
            </span>
            <svg
              className="h-5 w-5 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </span>
        </Link>
        <Link
          to="/katalog?type=iqtibos"
          className="group flex flex-col gap-2 rounded-2xl border border-soft-200 bg-feature-light/40 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-feature-light text-feature">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M7 7h4v4c0 3-1.5 5.2-4 6l-1-1.6c1.4-.6 2.2-1.7 2.4-3.4H7V7zm7 0h4v4c0 3-1.5 5.2-4 6l-1-1.6c1.4-.6 2.2-1.7 2.4-3.4H14V7z" />
            </svg>
          </span>
          <span className="font-display text-xl font-semibold transition-colors group-hover:text-feature">
            Iqtiboslar
          </span>
          <span className="text-sub">
            Boshqa manbadan olingan ko'chirma — she'r, hikmat, maqol va boshqalar
          </span>
          <span className="mt-2 flex items-end justify-between">
            <span className="font-display text-[clamp(28px,4vw,40px)] font-semibold leading-none text-feature">
              {stats?.byType["iqtibos"] ?? "—"}
            </span>
            <svg
              className="h-5 w-5 text-feature opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </span>
        </Link>
      </section>

      {/* Semantik maydonlar */}
      {filters && (
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-semibold">
            Semantik maydonlar
          </h2>
          <div className="flex flex-wrap gap-2">
            {filters.semanticFields.map((f, i) => {
              const color = CHIP_COLORS[i % CHIP_COLORS.length];
              return (
                <Link
                  key={f.value}
                  to={`/katalog?semantic_field=${encodeURIComponent(f.value)}`}
                  className="flex items-center gap-2 rounded-full border border-soft-200 bg-white-0 px-4 py-2 font-medium text-sub transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-md"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: color }}
                    aria-hidden
                  />
                  {f.value} <span className="text-soft">({f.count})</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Alifbo indeksi */}
      {filters && (
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-semibold">Alifbo bo'yicha</h2>
          <div className="flex flex-wrap gap-1.5">
            {filters.letters.map((l) => (
              <Link
                key={l}
                to={`/katalog?letter=${encodeURIComponent(l)}`}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-soft-200 font-medium text-sub transition-all hover:border-primary hover:bg-primary hover:text-white-0"
              >
                {l}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
