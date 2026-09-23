import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, TYPE_COLORS, TYPE_LABELS, type EntryType, type GraphData } from "../api";

/* Butun tezaurusning interaktiv semantik tarmog'i.
   Kuch (force) simulyatsiyasi kutubxonasiz yozilgan: tugunlar bir-birini
   itaradi, bog'lar prujina kabi tortadi. G'ildirak — masshtab, sudrash —
   surish, tugun bosilsa — sahifasiga o'tadi. */

interface SimNode {
  id: string;
  label: string;
  kind: "entry" | "hypernym";
  type?: string;
  count?: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

const COLORS: Record<string, string> = {
  ...TYPE_COLORS,
  hypernym: "#a3a3a3",
};

const W = 1200;
const H = 900;

function buildSim(data: GraphData): { nodes: SimNode[]; links: [number, number, string][] } {
  const idx = new Map<string, number>();
  const nodes: SimNode[] = data.nodes.map((n, i) => {
    idx.set(n.id, i);
    // Boshlang'ich joylashuv: aylana bo'ylab deterministik sochish
    const a = (i * 2.399963) % (Math.PI * 2); // oltin burchak
    const rad = 120 + (i % 17) * 22;
    return {
      id: n.id,
      label: n.label,
      kind: n.kind,
      type: n.type,
      count: n.count,
      x: W / 2 + Math.cos(a) * rad,
      y: H / 2 + Math.sin(a) * rad,
      vx: 0,
      vy: 0,
      r: n.kind === "hypernym" ? Math.min(10 + (n.count ?? 1) * 1.1, 26) : 7,
    };
  });
  const links: [number, number, string][] = [];
  for (const e of data.edges) {
    const s = idx.get(e.source);
    const t = idx.get(e.target);
    if (s !== undefined && t !== undefined) links.push([s, t, e.kind]);
  }
  return { nodes, links };
}

function tick(nodes: SimNode[], links: [number, number, string][], alpha: number) {
  // Itarish (soddalashtirilgan O(n²) — ~140 tugun uchun yetarli)
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      let dx = a.x - b.x;
      let dy = a.y - b.y;
      let d2 = dx * dx + dy * dy;
      if (d2 < 1) {
        dx = (Math.random() - 0.5) * 2;
        dy = (Math.random() - 0.5) * 2;
        d2 = dx * dx + dy * dy;
      }
      if (d2 > 90000) continue;
      const f = (2600 * alpha) / d2;
      const d = Math.sqrt(d2);
      a.vx += (dx / d) * f;
      a.vy += (dy / d) * f;
      b.vx -= (dx / d) * f;
      b.vy -= (dy / d) * f;
    }
  }
  // Bog' prujinalari
  for (const [si, ti] of links) {
    const s = nodes[si];
    const t = nodes[ti];
    const dx = t.x - s.x;
    const dy = t.y - s.y;
    const d = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
    const rest = s.kind === "hypernym" || t.kind === "hypernym" ? 85 : 65;
    const f = ((d - rest) / d) * 0.06 * alpha * 10;
    s.vx += dx * f;
    s.vy += dy * f;
    t.vx -= dx * f;
    t.vy -= dy * f;
  }
  // Markazga tortish + harakat
  for (const n of nodes) {
    n.vx += (W / 2 - n.x) * 0.0035 * alpha * 10;
    n.vy += (H / 2 - n.y) * 0.0035 * alpha * 10;
    n.vx *= 0.85;
    n.vy *= 0.85;
    n.x += n.vx;
    n.y += n.vy;
    // Hech bir tugun "qochib ketmasin" — maksimal radiusga qaytariladi
    const dx = n.x - W / 2;
    const dy = n.y - H / 2;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 640) {
      n.x = W / 2 + (dx / dist) * 640;
      n.y = H / 2 + (dy / dist) * 640;
    }
  }
}

export default function NetworkPage() {
  const [data, setData] = useState<GraphData | null>(null);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<"all" | EntryType>("all");
  const [hover, setHover] = useState<number | null>(null);
  const [, forceRender] = useState(0);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: W, h: H });
  const simRef = useRef<{ nodes: SimNode[]; links: [number, number, string][] } | null>(null);
  const panRef = useRef<{ px: number; py: number; vx: number; vy: number } | null>(null);
  const userMoved = useRef(false); // foydalanuvchi surdi/masshtabladi — avto-moslashtirish to'xtaydi
  const svgRef = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.graph().then(setData).catch(() => setError(true));
  }, []);

  // Ko'rinishni graf chegaralariga moslashtirish
  const fitView = useCallback(() => {
    const sim = simRef.current;
    if (!sim || sim.nodes.length === 0) return;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of sim.nodes) {
      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x > maxX) maxX = n.x;
      if (n.y > maxY) maxY = n.y;
    }
    const pad = 80;
    setViewBox({
      x: minX - pad,
      y: minY - pad,
      w: Math.max(maxX - minX + pad * 2, 300),
      h: Math.max(maxY - minY + pad * 2, 300),
    });
  }, []);

  // Simulyatsiya
  useEffect(() => {
    if (!data) return;
    simRef.current = buildSim(data);
    userMoved.current = false;
    let alpha = 1;
    let raf = 0;
    const step = () => {
      const sim = simRef.current;
      if (!sim) return;
      for (let k = 0; k < 3; k++) tick(sim.nodes, sim.links, alpha);
      alpha *= 0.985;
      if (!userMoved.current) fitView();
      forceRender((v) => v + 1);
      if (alpha > 0.02) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [data, fitView]);

  const neighbors = useMemo(() => {
    const sim = simRef.current;
    if (!sim || hover === null) return new Set<number>();
    const set = new Set<number>([hover]);
    for (const [s, t] of sim.links) {
      if (s === hover) set.add(t);
      if (t === hover) set.add(s);
    }
    return set;
  }, [hover, data]);

  const visible = (n: SimNode) =>
    filter === "all" || n.kind === "hypernym" || n.type === filter;

  /* --- pan / zoom --- */
  const zoomBy = (scale: number) => {
    userMoved.current = true;
    setViewBox((vb) => {
      const w = Math.min(Math.max(vb.w * scale, 150), 3000);
      const h = w * (vb.h / vb.w);
      return {
        x: vb.x + (vb.w - w) / 2,
        y: vb.y + (vb.h - h) / 2,
        w,
        h,
      };
    });
  };

  const onWheel = (e: React.WheelEvent) => {
    const svg = svgRef.current;
    if (!svg) return;
    userMoved.current = true;
    const rect = svg.getBoundingClientRect();
    const mx = viewBox.x + ((e.clientX - rect.left) / rect.width) * viewBox.w;
    const my = viewBox.y + ((e.clientY - rect.top) / rect.height) * viewBox.h;
    const scale = e.deltaY > 0 ? 1.15 : 1 / 1.15;
    const w = Math.min(Math.max(viewBox.w * scale, 150), 3000);
    const h = w * (viewBox.h / viewBox.w);
    setViewBox({ x: mx - ((mx - viewBox.x) / viewBox.w) * w, y: my - ((my - viewBox.y) / viewBox.h) * h, w, h });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    userMoved.current = true;
    panRef.current = { px: e.clientX, py: e.clientY, vx: viewBox.x, vy: viewBox.y };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const p = panRef.current;
    const svg = svgRef.current;
    if (!p || !svg) return;
    const rect = svg.getBoundingClientRect();
    setViewBox((vb) => ({
      ...vb,
      x: p.vx - ((e.clientX - p.px) / rect.width) * vb.w,
      y: p.vy - ((e.clientY - p.py) / rect.height) * vb.h,
    }));
  };
  const onPointerUp = () => {
    panRef.current = null;
  };

  if (error) {
    return <p className="py-16 text-center text-sub">Tarmoqni yuklab bo'lmadi.</p>;
  }

  const sim = simRef.current;
  /* Masshtab koeffitsiyenti: tugun/yozuv o'lchamlari SVG birligida shunga
     ko'paytiriladi — ekranda doimiy bo'lib qoladi. Natijada yaqinlashgan
     sari tugunlar orasidagi masofa ochilib boradi, zichlik kamayadi. */
  const k = Math.min(Math.max(viewBox.w / W, 0.22), 2);
  const showEntryLabels = k < 0.55;

  return (
    <div className="flex flex-col gap-5 py-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[clamp(24px,4vw,32px)] font-semibold">
            Semantik tarmoq
          </h1>
          <p className="text-sub">
            Barcha birliklar va giperonim guruhlari bitta grafda. G'ildirak —
            masshtab, sudrash — surish, tugun ustiga boring yoki bosing.
          </p>
        </div>
        <div className="flex max-w-full overflow-x-auto rounded-full border border-soft-200 p-1">
          {(
            [
              ["all", "Hammasi"],
              ["allyuziv-nom", "Allyuziv nomlar"],
              ["iqtibos", "Iqtiboslar"],
              ["maqol", "Maqollar"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 font-medium transition-colors sm:px-4 ${
                filter === v ? "bg-surface-800 text-white-0" : "text-sub hover:text-strong"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sub">
        {(Object.keys(TYPE_COLORS) as EntryType[]).map((t) => (
          <span key={t} className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full" style={{ background: TYPE_COLORS[t] }} />
            {TYPE_LABELS[t]}
          </span>
        ))}
        <span className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-full border-2 border-soft" style={{ background: "#f7f7f7" }} />
          Giperonim guruhi
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-6 bg-highlight" /> Sinonimik munosabat
        </span>
      </div>

      {!sim ? (
        <div className="skeleton h-[75vh] rounded-2xl" aria-label="Yuklanmoqda" />
      ) : (
        <div className="relative">
        {/* Masshtab tugmalari */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
          <button
            onClick={() => zoomBy(1 / 1.4)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-soft-200 bg-white-0 font-display text-xl font-semibold text-sub shadow-sm transition-colors hover:border-primary hover:text-primary"
            aria-label="Kattalashtirish"
            title="Kattalashtirish"
          >
            +
          </button>
          <button
            onClick={() => zoomBy(1.4)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-soft-200 bg-white-0 font-display text-xl font-semibold text-sub shadow-sm transition-colors hover:border-primary hover:text-primary"
            aria-label="Kichiklashtirish"
            title="Kichiklashtirish"
          >
            −
          </button>
          <button
            onClick={() => {
              userMoved.current = false;
              fitView();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-soft-200 bg-white-0 text-sub shadow-sm transition-colors hover:border-primary hover:text-primary"
            aria-label="Butun grafni ko'rsatish"
            title="Butun grafni ko'rsatish"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 9V4h5M20 9V4h-5M4 15v5h5m11-5v5h-5" />
            </svg>
          </button>
        </div>
        <svg
          ref={svgRef}
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          className="h-[75vh] w-full cursor-grab touch-none rounded-2xl border border-soft-200 bg-weak-50/60 active:cursor-grabbing"
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          role="img"
          aria-label="Semantik tarmoq grafi"
        >
          {/* Bog'lar */}
          {sim.links.map(([s, t, kind], i) => {
            const a = sim.nodes[s];
            const b = sim.nodes[t];
            if (!visible(a) || !visible(b)) return null;
            const active = hover !== null && (s === hover || t === hover);
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={active ? (kind === "synonym" ? "#fb4ba3" : "#335cff") : kind === "synonym" ? "#fb4ba380" : "#d1d1d1"}
                strokeWidth={(active ? 2.5 : kind === "synonym" ? 1.6 : 1) * k}
                opacity={hover !== null && !active ? 0.25 : 1}
              />
            );
          })}

          {/* Tugunlar */}
          {sim.nodes.map((n, i) => {
            if (!visible(n)) return null;
            const dim = hover !== null && !neighbors.has(i);
            const isHyp = n.kind === "hypernym";
            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                opacity={dim ? 0.25 : 1}
                className="cursor-pointer"
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isHyp) navigate(`/katalog?hypernym=${encodeURIComponent(n.label)}`);
                  else navigate(`/birlik/${n.id}`);
                }}
              >
                <circle
                  r={n.r * k}
                  fill={isHyp ? "#f7f7f7" : COLORS[n.type ?? ""] ?? "#a3a3a3"}
                  stroke={isHyp ? "#a3a3a3" : "#ffffff"}
                  strokeWidth={(isHyp ? 2 : 1.5) * k}
                />
                {(isHyp || showEntryLabels || hover === i) && (
                  <text
                    y={-n.r * k - 6 * k}
                    textAnchor="middle"
                    fontSize={(isHyp ? 13 : 12) * k}
                    fontWeight={isHyp || hover === i ? 600 : 400}
                    fill="#171717"
                    stroke="#ffffff"
                    strokeWidth={3 * k}
                    paintOrder="stroke"
                    style={{ pointerEvents: "none" }}
                  >
                    {n.label.length > 28 ? n.label.slice(0, 27) + "…" : n.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        </div>
      )}
    </div>
  );
}
