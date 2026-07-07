import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, TYPE_LABELS, type EntryDetail } from "../api";
import Badge from "../components/Badge";
import EntryCard from "../components/EntryCard";
import TooltipLink from "../components/TooltipLink";
import NodeDiagram from "../components/NodeDiagram";
import StarOrnament from "../components/StarOrnament";

/* Bo'lim: rangli doiradagi ikonka + sarlavha, mazmun ikonka ostidan boshlanadi */
function Section({
  icon,
  title,
  color,
  bg,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  bg: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ color, background: bg }}
          aria-hidden
        >
          {icon}
        </span>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
      </div>
      <div className="sm:pl-[42px]">{children}</div>
    </section>
  );
}

const ICONS = {
  izoh: (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  ),
  namuna: (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M7 7h4v4c0 3-1.5 5.2-4 6l-1-1.6c1.4-.6 2.2-1.7 2.4-3.4H7V7zm7 0h4v4c0 3-1.5 5.2-4 6l-1-1.6c1.4-.6 2.2-1.7 2.4-3.4H14V7z" />
    </svg>
  ),
  manba: (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M6 2h13a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 16a1 1 0 0 0 0 2h12v-2H6zm2-11h8v2H8V7z" />
    </svg>
  ),
  sharh: (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2zm3 5h10v2H7V8zm0 4h7v2H7v-2z" />
    </svg>
  ),
  munosabat: (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M17 7h-3v2h3a3 3 0 1 1 0 6h-3v2h3a5 5 0 0 0 0-10zm-7 8H7a3 3 0 1 1 0-6h3V7H7a5 5 0 0 0 0 10h3v-2zm-2-4h8v2H8v-2z" />
    </svg>
  ),
  lingvistik: (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 3 1 9l11 6 9-4.9V17h2V9L12 3zM5 13.2V17c0 1.7 3.1 4 7 4s7-2.3 7-4v-3.8l-7 3.8-7-3.8z" />
    </svg>
  ),
};

function SourceRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 border-b border-soft-200 py-2.5 last:border-b-0 sm:flex-row sm:gap-2">
      <dt className="shrink-0 font-medium text-sub sm:w-32">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function EntryPage() {
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<EntryDetail | null>(null);
  const [error, setError] = useState(false);
  const [view, setView] = useState<"dict" | "nodes">("dict");

  useEffect(() => {
    setEntry(null);
    setError(false);
    setView("dict");
    if (id) {
      api.entry(id).then(setEntry).catch(() => setError(true));
    }
    window.scrollTo(0, 0);
  }, [id]);

  if (error) {
    return <p className="py-16 text-center text-sub">Birlik topilmadi.</p>;
  }
  if (!entry) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 py-2" aria-label="Yuklanmoqda">
        <div className="flex flex-col gap-4 rounded-2xl border border-soft-200 p-6 sm:p-8">
          <div className="skeleton h-9 w-1/2" />
          <div className="skeleton h-5 w-1/3" />
          <div className="flex gap-2">
            <div className="skeleton h-6 w-24 rounded-full" />
            <div className="skeleton h-6 w-16 rounded-full" />
          </div>
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="skeleton h-6 w-40" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
          </div>
        ))}
      </div>
    );
  }

  const it = entry.intertext;
  const src = entry.originalSource;
  const sourceLine = [it.author, it.work && `«${it.work}»`, it.year, it.page]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="anim-fade-up mx-auto flex w-full max-w-3xl flex-col gap-7 py-2">
      {/* Sarlavha bloki — girih naqshli karta */}
      <header className="relative overflow-hidden rounded-2xl border border-soft-200 p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-gradient-to-br from-primary-light/50 via-transparent to-feature-light/40" />
        </div>

        <div className="relative flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="font-display text-[clamp(24px,5vw,36px)] font-semibold leading-tight">
              {entry.unit}
            </h1>
            <div className="no-print flex shrink-0 items-center gap-2">
              <button
                title="Audio talaffuz — tez orada"
                disabled
                className="flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-soft-200 bg-white-0/70 text-disabled"
                aria-label="Audio talaffuz (tez orada)"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" />
                </svg>
              </button>
              <button
                onClick={() => window.print()}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-soft-200 bg-white-0/70 text-sub transition-colors hover:border-primary hover:text-primary"
                aria-label="Chop etish"
                title="Chop etish"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M19 8H5a3 3 0 0 0-3 3v5h4v4h12v-4h4v-5a3 3 0 0 0-3-3zm-3 10H8v-4h8v4zm3-6.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM18 3H6v4h12V3z" />
                </svg>
              </button>
            </div>
          </div>

          {entry.pronunciations.length > 0 && (
            <p className="text-sub">
              <span className="font-medium">Talaffuzi:</span>{" "}
              {entry.pronunciations.join(" / ")}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Badge variant={entry.type === "iqtibos" ? "type-iqtibos" : "type-allyuziv"}>
              {TYPE_LABELS[entry.type]}
            </Badge>
            {entry.recognition && (
              <Badge variant={entry.recognition === "yadro" ? "yadro" : "periferiya"}>
                {entry.recognition}
              </Badge>
            )}
            {entry.semanticField && <Badge variant="field">{entry.semanticField}</Badge>}
          </div>

          {/* Ko'rinish almashtirgich */}
          <div className="no-print flex w-fit rounded-full border border-soft-200 bg-white-0/80 p-1">
            {(
              [
                ["dict", "Lug'at"],
                ["nodes", "Uzellar sxemasi"],
              ] as const
            ).map(([v, label]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-full px-4 py-1.5 font-medium transition-colors ${
                  view === v ? "bg-surface-800 text-white-0" : "text-sub hover:text-strong"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {view === "nodes" ? (
        <NodeDiagram entry={entry} />
      ) : (
        <div className="flex flex-col gap-7">
          {/* Izoh (asl manba tavsifi) */}
          {src.description && (
            <Section icon={ICONS.izoh} title="Izoh" color="#fb3748" bg="#ffebec">
              <p className="italic">{src.description}</p>
            </Section>
          )}

          {/* Namuna */}
          {entry.contextText && (
            <Section icon={ICONS.namuna} title="Namuna" color="#335cff" bg="#ebf1ff">
              <figure className="relative rounded-2xl bg-weak-50 p-5 pt-7">
                <span
                  className="absolute -top-1 left-4 select-none font-display text-6xl leading-none text-primary/20"
                  aria-hidden
                >
                  «
                </span>
                <blockquote className="text-lg italic leading-relaxed whitespace-pre-line">
                  {entry.contextText}
                </blockquote>
                {sourceLine && (
                  <figcaption className="mt-2 text-sub">— {sourceLine}</figcaption>
                )}
              </figure>
            </Section>
          )}

          {/* Asl manba */}
          {(src.author || src.work || src.period) && (
            <Section icon={ICONS.manba} title="Asl manba" color="#1fc16b" bg="#e0faec">
              <dl className="flex flex-col rounded-2xl border border-soft-200 px-5 py-2">
                <SourceRow label="Muallif" value={src.author} />
                <SourceRow label="Asar" value={src.work} />
                <SourceRow label="Janr" value={src.genre} />
                <SourceRow label="Davr" value={src.period} />
                <SourceRow label="Nashriyot" value={src.publisher} />
              </dl>
            </Section>
          )}

          {/* Kontekstual sharh */}
          {entry.commentary && (
            <Section icon={ICONS.sharh} title="Kontekstual sharh" color="#ff8447" bg="#fff1eb">
              <p>{entry.commentary}</p>
            </Section>
          )}

          {/* Semantik munosabat */}
          {(entry.synonymsLinked.length > 0 || entry.hypernym || entry.hyponym) && (
            <Section
              icon={ICONS.munosabat}
              title="Semantik munosabat"
              color="#47c2ff"
              bg="#ebf8ff"
            >
              <div className="grid gap-4 rounded-2xl border border-soft-200 p-5 sm:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium text-sub">Kontekstual sinonimlar</h3>
                  {entry.synonymsLinked.length > 0 ? (
                    <ul className="flex flex-col gap-2.5">
                      {entry.synonymsLinked.map((s, i) => {
                        // "Nom (tavsif)" → nom pill'da, tavsif ostida
                        const m = s.text.match(/^([^(]+?)\s*\((.+?)\)\s*$/);
                        const name = m ? m[1].trim() : s.text;
                        const desc = m ? m[2].trim() : "";
                        return (
                          <li key={i} className="flex flex-col gap-1">
                            <span className="w-fit rounded-full border border-soft-200 px-3 py-1 transition-colors hover:border-primary">
                              <TooltipLink entryId={s.entryId} text={name} />
                            </span>
                            {desc && <p className="text-sub">{desc}</p>}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <span className="text-soft">—</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium text-sub">Giperonim</h3>
                  {entry.hypernym ? (
                    <Link
                      to={`/katalog?hypernym=${encodeURIComponent(entry.hypernym)}`}
                      className="w-fit rounded-full bg-primary-light px-3 py-1 font-medium text-primary-darker transition-colors hover:bg-primary hover:text-white-0"
                    >
                      {entry.hypernym}
                    </Link>
                  ) : (
                    <span className="text-soft">—</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium text-sub">Giponim</h3>
                  {entry.hyponym ? (
                    <p className="whitespace-pre-line">{entry.hyponym}</p>
                  ) : (
                    <span className="text-soft">—</span>
                  )}
                </div>
              </div>
            </Section>
          )}

          {/* Lingvistik izoh */}
          {entry.note && (
            <Section icon={ICONS.lingvistik} title="Lingvistik izoh" color="#7d52f4" bg="#efebff">
              <p className="whitespace-pre-line">{entry.note}</p>
            </Section>
          )}

          {/* Aloqador birliklar */}
          {entry.related.length > 0 && (
            <section className="no-print flex flex-col gap-4 border-t border-soft-200 pt-6">
              <div className="flex items-center gap-2.5">
                <StarOrnament className="h-5 w-5 text-primary/60" />
                <h2 className="font-display text-xl font-semibold">
                  Shu guruhdagi boshqa birliklar
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {entry.related.map((e) => (
                  <EntryCard key={e.id} entry={e} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </article>
  );
}
