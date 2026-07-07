import { useState } from "react";
import { Link } from "react-router-dom";
import { api, TYPE_LABELS, type AnalyzeResult } from "../api";
import TooltipLink from "../components/TooltipLink";
import Badge from "../components/Badge";

const SAMPLE = `Bu yoshlar, masalan, adabiyot ilmida Navoiy va Boburdek, Qodiriy va Cho'lpondek ulug' ijodkorlarning asarlarini tadqiq etish uchun kelishadi. Ulug' Navoiyning ko'pgina asarlarini «piri komil» talaba yoshlarning ongiga quyayotgandek edi. Sherlok Xolms bo'p ket-ey!`;

export default function AnalyzePage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [analyzed, setAnalyzed] = useState(""); // natija qaysi matnga tegishli
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const run = async (t: string) => {
    const value = t.trim();
    if (!value || busy) return;
    setBusy(true);
    setError(false);
    try {
      const r = await api.analyze(value);
      setResult(r);
      setAnalyzed(value);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  /* Matnni belgilangan qismlar bilan bo'lish */
  const segments: React.ReactNode[] = [];
  if (result && analyzed) {
    let pos = 0;
    result.matches.forEach((m, i) => {
      if (m.start > pos) segments.push(analyzed.slice(pos, m.start));
      segments.push(
        <mark
          key={i}
          className={`rounded px-0.5 font-medium ${
            m.type === "iqtibos"
              ? "bg-feature-light text-feature"
              : "bg-primary-light text-primary-darker"
          }`}
        >
          <TooltipLink entryId={m.entryId} text={analyzed.slice(m.start, m.end)} />
        </mark>
      );
      pos = m.end;
    });
    if (pos < analyzed.length) segments.push(analyzed.slice(pos));
  }

  return (
    <div className="flex flex-col gap-6 py-2">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[clamp(24px,4vw,32px)] font-semibold">
          Matn tahlili
        </h1>
        <p className="max-w-2xl text-sub">
          Ixtiyoriy matnni joylang — tizim undagi tezaurusda mavjud
          intertekstual birliklarni (allyuziv nomlar va iqtiboslarni) avtomatik
          topib belgilaydi. Imlo va apostrof farqlari hisobga olinadi.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          maxLength={30000}
          placeholder="Matnni shu yerga joylang… (masalan, roman parchasi)"
          className="w-full resize-y rounded-2xl border border-soft-200 bg-white-0 p-4 leading-7 outline-none transition-colors focus:border-primary"
          aria-label="Tahlil qilinadigan matn"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => run(text)}
            disabled={!text.trim() || busy}
            className="rounded-xl bg-primary px-6 py-3 font-medium text-white-0 transition-colors enabled:hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-disabled"
          >
            {busy ? "Tahlil qilinmoqda…" : "Tahlil qilish"}
          </button>
          <button
            onClick={() => {
              setText(SAMPLE);
              run(SAMPLE);
            }}
            className="rounded-xl border border-soft-200 px-5 py-3 font-medium text-sub transition-colors hover:border-primary hover:text-primary"
          >
            Namunani sinash
          </button>
          {error && (
            <span className="text-error" role="alert">
              Tahlil qilib bo'lmadi — qayta urinib ko'ring.
            </span>
          )}
        </div>
      </div>

      {result && (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Belgilangan matn */}
          <section className="flex flex-col gap-3 rounded-2xl border border-soft-200 p-5 sm:p-6">
            <h2 className="font-display text-xl font-semibold">
              Belgilangan matn
            </h2>
            {result.matches.length === 0 ? (
              <p className="text-sub">
                Bu matnda tezaurusdagi birliklar topilmadi. Boshqa parcha bilan
                urinib ko'ring.
              </p>
            ) : (
              <p className="whitespace-pre-wrap leading-8">{segments}</p>
            )}
          </section>

          {/* Topilganlar ro'yxati */}
          <aside className="flex h-fit flex-col gap-3 rounded-2xl border border-soft-200 p-5">
            <h2 className="font-display text-xl font-semibold">
              Topildi: {result.found.length} ta birlik
            </h2>
            {result.found.length === 0 ? (
              <p className="text-sub">—</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {result.found.map((f) => (
                  <li key={f.entryId} className="flex items-center justify-between gap-2">
                    <Link
                      to={`/birlik/${f.entryId}`}
                      className="font-medium text-primary underline-offset-2 hover:underline"
                    >
                      {f.unit}
                    </Link>
                    <span className="flex items-center gap-2">
                      <Badge
                        variant={f.type === "iqtibos" ? "type-iqtibos" : "type-allyuziv"}
                      >
                        {TYPE_LABELS[f.type]}
                      </Badge>
                      {f.count > 1 && <span className="text-sub">×{f.count}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
