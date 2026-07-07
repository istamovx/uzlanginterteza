import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { EntryDetail } from "../api";
import TooltipLink from "./TooltipLink";

/* "Layli va Majnun" diagrammasi uslubidagi uzellar ko'rinishi — interaktiv:
   markazdagi birlikdan har bir uzelga SVG chiziq tortiladi, karta ustiga
   borilganda chiziq yonadi, sinonim va giperonimlar bosiladi. */

interface LineSeg {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <p>
      <b>{label}:</b> {value}
    </p>
  );
}

export default function NodeDiagram({ entry }: { entry: EntryDetail }) {
  const it = entry.intertext;
  const src = entry.originalSource;
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(new Map<string, HTMLDivElement>());
  const [lines, setLines] = useState<Record<string, LineSeg>>({});
  const [active, setActive] = useState<string | null>(null);

  const measure = useCallback(() => {
    const cont = containerRef.current;
    const center = centerRef.current;
    if (!cont || !center) return;
    const cRect = cont.getBoundingClientRect();
    const m = center.getBoundingClientRect();
    const mx = m.left + m.width / 2 - cRect.left;
    const my = m.top + m.height / 2 - cRect.top;
    const next: Record<string, LineSeg> = {};
    cardRefs.current.forEach((el, key) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2 - cRect.left;
      const cy = r.top + r.height / 2 - cRect.top;
      // Kartaning markazga qaragan chekkasi
      let x2 = cx;
      let y2 = cy;
      if (Math.abs(cx - mx) > Math.abs(cy - my)) {
        x2 = cx < mx ? r.right - cRect.left : r.left - cRect.left;
      } else {
        y2 = cy < my ? r.bottom - cRect.top : r.top - cRect.top;
      }
      next[key] = { x1: mx, y1: my, x2, y2 };
    });
    setLines(next);
  }, []);

  useLayoutEffect(() => {
    measure();
    const t = setTimeout(measure, 120); // shrift yuklangach qayta
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, [measure, entry.id]);

  const setCardRef = (key: string) => (el: HTMLDivElement | null) => {
    if (el) cardRefs.current.set(key, el);
    else cardRefs.current.delete(key);
  };

  const nodes: { key: string; label: string; content: React.ReactNode }[] = [];

  nodes.push({
    key: "birlik",
    label: "Intertekstual birlik",
    content: (
      <>
        <Field
          label={entry.type === "iqtibos" ? "Iqtibos" : "Allyuziv nom"}
          value={entry.unit}
        />
        <Field label="Talaffuz" value={entry.pronunciations.join(" / ")} />
      </>
    ),
  });
  nodes.push({
    key: "matn",
    label: "Intertekstual matn",
    content: (
      <>
        <p className="mb-2 italic">{entry.contextText}</p>
        <Field label="Muallif" value={it.author} />
        <Field label="Asar" value={it.work} />
        <Field label="Janr" value={it.genre} />
        <Field label="Davr" value={it.year} />
        <Field label="Sahifa" value={it.page} />
      </>
    ),
  });
  if (src.author || src.work) {
    nodes.push({
      key: "manba",
      label: "Asl manba",
      content: (
        <>
          <Field label="Muallif" value={src.author} />
          <Field label="Asar" value={src.work} />
          <Field label="Janr" value={src.genre} />
          <Field label="Nashriyot" value={src.publisher} />
          <Field label="Davr" value={src.period} />
        </>
      ),
    });
  }
  if (entry.recognition) {
    nodes.push({
      key: "tanilish",
      label: "Tanilish darajasi",
      content: <p className="capitalize">{entry.recognition}</p>,
    });
  }
  if (entry.commentary) {
    nodes.push({
      key: "sharh",
      label: "Kontekstual sharh",
      content: <p>{entry.commentary}</p>,
    });
  }
  if (entry.semanticField) {
    nodes.push({
      key: "maydon",
      label: "Semantik maydon",
      content: <p>{entry.semanticField}</p>,
    });
  }
  if (entry.synonymsLinked.length > 0 || entry.hypernym || entry.hyponym) {
    nodes.push({
      key: "munosabat",
      label: "Semantik munosabat",
      content: (
        <>
          {entry.synonymsLinked.length > 0 && (
            <p className="flex flex-wrap items-center gap-x-1.5">
              <b>Kontekstual sinonim:</b>
              {entry.synonymsLinked.map((s, i) => {
                const m = s.text.match(/^([^(]+?)\s*\((.+?)\)\s*$/);
                const name = m ? m[1].trim() : s.text;
                const desc = m ? m[2].trim() : "";
                return (
                  <span key={i}>
                    <TooltipLink entryId={s.entryId} text={name} />
                    {desc && <span className="text-sub"> ({desc})</span>}
                    {i < entry.synonymsLinked.length - 1 && ","}
                  </span>
                );
              })}
            </p>
          )}
          {entry.hypernym && (
            <p>
              <b>Giperonim:</b>{" "}
              <Link
                to={`/katalog?hypernym=${encodeURIComponent(entry.hypernym)}`}
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                {entry.hypernym}
              </Link>
            </p>
          )}
          <Field label="Giponim" value={entry.hyponym} />
        </>
      ),
    });
  }
  if (entry.note) {
    nodes.push({
      key: "izoh",
      label: "Izoh",
      content: <p>{entry.note}</p>,
    });
  }

  const left = nodes.filter((_, i) => i % 2 === 0);
  const right = nodes.filter((_, i) => i % 2 === 1);

  const card = (n: (typeof nodes)[number]) => (
    <div
      key={n.key}
      ref={setCardRef(n.key)}
      onMouseEnter={() => setActive(n.key)}
      onMouseLeave={() => setActive(null)}
      className={`relative z-10 rounded-xl border bg-white-0 p-4 shadow-sm transition-all duration-200 ${
        active === n.key
          ? "-translate-y-0.5 border-primary shadow-md"
          : "border-soft-200"
      }`}
    >
      <span
        className={`mb-1.5 inline-block rounded-lg px-2.5 py-1 font-medium text-white-0 transition-colors ${
          active === n.key ? "bg-primary" : "bg-surface-800"
        }`}
      >
        {n.label}
      </span>
      <div className="flex flex-col gap-1">{n.content}</div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col gap-5 rounded-2xl bg-weak-50 p-4 sm:p-6"
    >
      {/* Bog'lovchi chiziqlar */}
      <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full" aria-hidden>
        {Object.entries(lines).map(([key, l]) => {
          const isActive = active === key;
          const midX = (l.x1 + l.x2) / 2;
          return (
            <path
              key={key}
              d={`M ${l.x1} ${l.y1} C ${midX} ${l.y1}, ${midX} ${l.y2}, ${l.x2} ${l.y2}`}
              fill="none"
              stroke={isActive ? "#335cff" : "#c9cede"}
              strokeWidth={isActive ? 2.5 : 1.5}
              strokeDasharray={isActive ? "none" : "5 4"}
            />
          );
        })}
      </svg>

      {/* Markaz tuguni */}
      <div className="relative z-10 mx-auto lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
        <div
          ref={centerRef}
          className="w-fit max-w-56 rounded-2xl border-2 border-primary bg-white-0 px-5 py-3 text-center font-display font-semibold shadow-md"
        >
          {entry.unit}
        </div>
      </div>

      {/* Ikki ustun — markaz uchun o'rtada bo'sh joy */}
      <div className="grid gap-5 lg:grid-cols-[1fr_14rem_1fr]">
        <div className="flex flex-col justify-around gap-5">{left.map(card)}</div>
        <div className="hidden lg:block" />
        <div className="flex flex-col justify-around gap-5">{right.map(card)}</div>
      </div>
    </div>
  );
}
