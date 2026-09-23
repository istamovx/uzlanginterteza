import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, TYPE_LABELS, type EntryDetail, type EntrySummary } from "../api";
import Badge, { typeVariant } from "./Badge";

/* Karta ma'lumotini to'liq o'qish oynasi. Native <dialog> — Esc, fokus
   tuzog'i va fon qoplamasi brauzerning o'zida. Kartadagi kontekst matni
   qisqartirilgan bo'ladi, shuning uchun to'liq yozuv API'dan olinadi. */
export default function EntryModal({
  entry,
  onClose,
}: {
  entry: EntrySummary;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [detail, setDetail] = useState<EntryDetail | null>(null);

  useEffect(() => {
    ref.current?.showModal();
    api.entry(entry.id).then(setDetail).catch(() => {});
  }, [entry.id]);

  const context = detail?.contextText ?? entry.contextText;
  const it = detail?.intertext;
  const source = [it?.author, it?.work && `«${it.work}»`, it?.year, it?.page]
    .filter(Boolean)
    .join(", ");

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // fon (backdrop) bosilganda yopish
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      aria-labelledby={`modal-${entry.id}`}
      className="m-auto max-h-[85vh] w-[min(640px,calc(100%-32px))] overflow-hidden rounded-2xl border border-soft-200 bg-white-0 p-0 text-strong shadow-2xl backdrop:bg-strong/50 backdrop:backdrop-blur-sm"
    >
      <div className="flex max-h-[85vh] flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-soft-200 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={typeVariant(entry.type)}>{TYPE_LABELS[entry.type]}</Badge>
            {entry.recognition && (
              <Badge variant={entry.recognition === "yadro" ? "yadro" : "periferiya"}>
                {entry.recognition}
              </Badge>
            )}
            {entry.semanticField && <Badge variant="field">{entry.semanticField}</Badge>}
          </div>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sub transition-colors hover:bg-weak-50 hover:text-strong"
            aria-label="Yopish"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-5 overflow-y-auto p-5 sm:p-6">
          <h2
            id={`modal-${entry.id}`}
            className="whitespace-pre-line font-display text-xl font-semibold leading-snug"
          >
            {entry.unit}
          </h2>

          {context && (
            <section className="flex flex-col gap-1.5">
              <h3 className="font-medium uppercase tracking-wide text-soft">Intertekstual matn</h3>
              <p className="whitespace-pre-line italic leading-7 text-sub">«{context}»</p>
              {source && <p className="text-sub">— {source}</p>}
            </section>
          )}

          {detail?.commentary && (
            <section className="flex flex-col gap-1.5">
              <h3 className="font-medium uppercase tracking-wide text-soft">Kontekstual sharh</h3>
              <p className="whitespace-pre-line leading-7">{detail.commentary}</p>
            </section>
          )}

          {!detail && <div className="skeleton h-16 rounded-xl" aria-label="Yuklanmoqda" />}
        </div>

        <div className="flex justify-end border-t border-soft-200 p-4 sm:px-6">
          <Link
            to={`/birlik/${entry.id}`}
            className="flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 font-medium text-white-0 transition-colors hover:bg-primary-dark"
          >
            Batafsil sahifa
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </Link>
        </div>
      </div>
    </dialog>
  );
}
