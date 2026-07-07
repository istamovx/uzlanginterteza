import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type FacetItem, type Filters, type Stats } from "../api";

/* Diagramma ranglari — Align UI palitrasidan tsikl bilan olinadi */
const PALETTE = [
  "#335cff", // primary
  "#7d52f4", // feature
  "#1fc16b", // success
  "#ff8447", // warning
  "#fb4ba3", // highlight
  "#47c2ff", // verified
  "#fb3748", // error
  "#2547d0", // primary-dark
];

/* Raqam 0 dan maqsadgacha "sanaladi" (reduced-motion'da darhol) */
function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min((t - t0) / duration, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function StatCard({
  label,
  value,
  color,
  bg,
  icon,
}: {
  label: string;
  value: number | string;
  color: string;
  bg: string;
  icon: React.ReactNode;
}) {
  const animated = useCountUp(typeof value === "number" ? value : 0);
  const shown = typeof value === "number" ? animated : value;
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-soft-200 p-5 text-center">
      <span
        className="flex h-11 w-11 items-center justify-center rounded-full"
        style={{ color, background: bg }}
      >
        {icon}
      </span>
      <span
        className="font-display text-[clamp(30px,4vw,40px)] font-semibold leading-none"
        style={{ color }}
      >
        {shown}
      </span>
      <span className="text-sub">{label}</span>
    </div>
  );
}

/* Gorizontal bar-chart qatori (bosiladigan — katalogga olib boradi) */
function BarRow({
  item,
  max,
  color,
  to,
}: {
  item: FacetItem;
  max: number;
  color: string;
  to: string;
}) {
  const pct = max > 0 ? Math.max((item.count / max) * 100, 4) : 0;
  return (
    <Link to={to} className="group flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sub transition-colors group-hover:text-strong">
          {item.value}
        </span>
        <span className="font-display font-semibold" style={{ color }}>
          {item.count}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-weak-50">
        <div
          className="h-full rounded-full transition-transform duration-300 group-hover:opacity-80"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </Link>
  );
}

/* Donut diagramma — SVG, segmentlar stroke-dasharray bilan */
function Donut({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: { label: string; count: number; color: string }[];
  centerLabel: string;
  centerValue: number;
}) {
  const total = segments.reduce((s, x) => s + x.count, 0) || 1;
  const R = 70;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <svg viewBox="0 0 180 180" className="h-44 w-44 shrink-0" role="img" aria-label={centerLabel}>
        {segments.map((s) => {
          const len = (s.count / total) * C;
          const el = (
            <circle
              key={s.label}
              cx="90"
              cy="90"
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="22"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 90 90)"
            >
              <title>{`${s.label}: ${s.count} ta (${Math.round((s.count / total) * 100)}%)`}</title>
            </circle>
          );
          offset += len;
          return el;
        })}
        <text
          x="90"
          y="86"
          textAnchor="middle"
          className="font-display"
          fontSize="34"
          fontWeight="600"
          fill="#171717"
        >
          {centerValue}
        </text>
        <text x="90" y="108" textAnchor="middle" fontSize="14" fill="#5c5c5c">
          {centerLabel}
        </text>
      </svg>
      <ul className="flex flex-col gap-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2.5">
            <span
              className="h-3.5 w-3.5 shrink-0 rounded-full"
              style={{ background: s.color }}
            />
            <span className="text-sub">{s.label}</span>
            <span className="font-display font-semibold">{s.count}</span>
            <span className="text-soft">
              ({Math.round((s.count / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl border border-soft-200 p-5 sm:p-6">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([api.stats(), api.filters()])
      .then(([s, f]) => {
        setStats(s);
        setFilters(f);
      })
      .catch(() => setError(true));
  }, []);

  if (error) {
    return <p className="py-16 text-center text-sub">Statistikani yuklab bo'lmadi.</p>;
  }
  if (!stats || !filters) {
    return <p className="py-16 text-center text-sub">Yuklanmoqda…</p>;
  }

  const yadro = stats.byRecognition["yadro"] ?? 0;
  const periferiya = stats.byRecognition["periferiya"] ?? 0;
  const unmarked = stats.total - yadro - periferiya;
  const maxField = Math.max(...filters.semanticFields.map((f) => f.count), 0);
  const maxWork = Math.max(...filters.works.map((w) => w.count), 0);

  return (
    <div className="flex flex-col gap-8 py-4">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-[clamp(24px,4vw,32px)] font-semibold">
          Tezaurus statistikasi
        </h1>
        <p className="max-w-2xl text-sub">
          Korpusdagi intertekstual birliklarning miqdoriy manzarasi — turlar,
          tanilish darajasi, semantik maydonlar va asarlar bo'yicha taqsimot.
        </p>
      </header>

      {/* Asosiy ko'rsatkichlar */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Jami birliklar"
          value={stats.total}
          color="#171717"
          bg="#f7f7f7"
          icon={
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5zm2 14h11v2H6a1 1 0 0 1 0-2z" />
            </svg>
          }
        />
        <StatCard
          label="Allyuziv nomlar"
          value={stats.byType["allyuziv-nom"] ?? 0}
          color="#335cff"
          bg="#ebf1ff"
          icon={
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 2 4 6v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-4zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
            </svg>
          }
        />
        <StatCard
          label="Iqtiboslar"
          value={stats.byType["iqtibos"] ?? 0}
          color="#7d52f4"
          bg="#efebff"
          icon={
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M7 7h4v4c0 3-1.5 5.2-4 6l-1-1.6c1.4-.6 2.2-1.7 2.4-3.4H7V7zm7 0h4v4c0 3-1.5 5.2-4 6l-1-1.6c1.4-.6 2.2-1.7 2.4-3.4H14V7z" />
            </svg>
          }
        />
        <StatCard
          label="Kontekstual sinonimlar"
          value={stats.synonyms ?? "—"}
          color="#1fc16b"
          bg="#e0faec"
          icon={
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M17 7h-3v2h3a3 3 0 1 1 0 6h-3v2h3a5 5 0 0 0 0-10zm-7 8H7a3 3 0 1 1 0-6h3V7H7a5 5 0 0 0 0 10h3v-2zm-2-4h8v2H8v-2z" />
            </svg>
          }
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Tanilish darajasi — donut */}
        <ChartCard title="Tanilish darajasi">
          <Donut
            centerLabel="birlik"
            centerValue={stats.total}
            segments={[
              { label: "Yadro", count: yadro, color: "#335cff" },
              { label: "Periferiya", count: periferiya, color: "#7d52f4" },
              ...(unmarked > 0
                ? [{ label: "Kiritilmoqda", count: unmarked, color: "#ebebeb" }]
                : []),
            ]}
          />
          <p className="text-sub">
            <b>Yadro</b> — keng auditoriya oson taniydigan birliklar;{" "}
            <b>periferiya</b> — maxsus bilim talab qiladigan birliklar.
          </p>
        </ChartCard>

        {/* To'ldirilganlik */}
        <ChartCard title="Ma'lumot to'ldirilganligi">
          <div className="flex flex-col justify-center gap-4">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[clamp(30px,4vw,40px)] font-semibold text-success">
                {stats.complete}
              </span>
              <span className="text-sub">/ {stats.total} birlik to'liq tavsiflangan</span>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-weak-50">
              <div
                className="h-full rounded-full bg-success"
                style={{ width: `${(stats.complete / stats.total) * 100}%` }}
              />
            </div>
            <p className="text-sub">
              Qolgan {stats.total - stats.complete} ta birlikning asl manbasi,
              sharhi va semantik munosabatlari kiritilish jarayonida. Talaffuz
              variantlari soni: <b>{stats.pronunciations ?? "—"}</b>.
            </p>
          </div>
        </ChartCard>
      </div>

      {/* Semantik maydonlar */}
      <ChartCard title="Semantik maydonlar bo'yicha taqsimot">
        <div className="flex flex-col gap-4">
          {filters.semanticFields.map((f, i) => (
            <BarRow
              key={f.value}
              item={f}
              max={maxField}
              color={PALETTE[i % PALETTE.length]}
              to={`/katalog?semantic_field=${encodeURIComponent(f.value)}`}
            />
          ))}
        </div>
      </ChartCard>

      {/* Asarlar bo'yicha */}
      <ChartCard title="Asarlar bo'yicha taqsimot">
        <div className="flex flex-col gap-4">
          {filters.works.map((w, i) => (
            <BarRow
              key={w.value}
              item={w}
              max={maxWork}
              color={PALETTE[(i + 2) % PALETTE.length]}
              to={`/katalog?work=${encodeURIComponent(w.value)}`}
            />
          ))}
        </div>
      </ChartCard>

      {/* Giperonim guruhlari xaritasi */}
      <ChartCard title="Giperonim guruhlari xaritasi">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filters.hypernyms.map((h, i) => {
            const color = PALETTE[i % PALETTE.length];
            return (
              <Link
                key={h.value}
                to={`/katalog?hypernym=${encodeURIComponent(h.value)}`}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-soft-200 p-4 text-center transition-shadow hover:shadow-md"
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full font-display text-lg font-semibold"
                  style={{ color, background: `${color}1a`, border: `2px solid ${color}` }}
                >
                  {h.count}
                </span>
                <span className="text-sub transition-colors group-hover:text-strong">
                  {h.value}
                </span>
              </Link>
            );
          })}
        </div>
      </ChartCard>
    </div>
  );
}
