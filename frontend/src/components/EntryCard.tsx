import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { TYPE_LABELS, type EntrySummary } from "../api";
import Badge, { typeVariant } from "./Badge";
import EntryModal from "./EntryModal";

export default function EntryCard({ entry }: { entry: EntrySummary }) {
  // Uzun iqtiboslar 5 qatordan keyin kesiladi; kesilgan bo'lsa "Ko'proq" chiqadi
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [clamped, setClamped] = useState(false);
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    const check = () => setClamped(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [entry.unit]);

  return (
    // Butun karta bosiladi: sarlavhadagi havola ::after orqali kartani qoplaydi,
    // "Ko'proq" tugmasi esa uning ustida (z-10) turadi — <a> ichida <button> bo'lmaydi
    <div className="group relative flex flex-col gap-2 rounded-2xl border border-soft-200 bg-white-0 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <h3
          ref={titleRef}
          className="line-clamp-5 font-display text-lg font-semibold leading-snug transition-colors group-hover:text-primary"
        >
          <Link
            to={`/birlik/${entry.id}`}
            className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary"
          >
            {entry.unit}
          </Link>
        </h3>
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-weak-50 text-soft opacity-0 transition-all duration-300 group-hover:bg-primary-light group-hover:text-primary group-hover:opacity-100"
          aria-hidden
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
          </svg>
        </span>
      </div>
      {clamped && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative z-10 flex w-fit items-center gap-1 font-medium text-primary hover:underline"
        >
          Ko'proq
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
          </svg>
        </button>
      )}
      {entry.contextText && (
        <p className="line-clamp-2 italic text-sub">«{entry.contextText}»</p>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <Badge variant={typeVariant(entry.type)}>{TYPE_LABELS[entry.type]}</Badge>
        {entry.recognition && (
          <Badge variant={entry.recognition === "yadro" ? "yadro" : "periferiya"}>
            {entry.recognition}
          </Badge>
        )}
        {entry.work && <span className="text-sub">«{entry.work}»</span>}
      </div>
      {open && <EntryModal entry={entry} onClose={() => setOpen(false)} />}
    </div>
  );
}
