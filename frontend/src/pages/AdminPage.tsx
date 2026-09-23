import { useEffect, useRef, useState } from "react";
import { api, TYPE_LABELS, type EntryType, type ImportReport, type Stats } from "../api";

const TOKEN_KEY = "adminToken";

const TYPE_OPTIONS: { value: EntryType; desc: string }[] = [
  { value: "allyuziv-nom", desc: "«ilova allyuziv nom» fayli" },
  { value: "iqtibos", desc: "«ilova Iqtibos» fayli" },
  { value: "maqol", desc: "«Maqol ilovam» fayli" },
];

export default function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? "");
  const [authed, setAuthed] = useState<boolean | null>(token ? null : false);
  const [loginInput, setLoginInput] = useState("");
  const [loginError, setLoginError] = useState(false);

  const [type, setType] = useState<EntryType>("allyuziv-nom");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const loadStats = () => api.stats().then(setStats).catch(() => {});

  // Saqlangan kalitni tekshirish
  useEffect(() => {
    if (!token) return;
    api.adminCheck(token).then((ok) => {
      setAuthed(ok);
      if (!ok) localStorage.removeItem(TOKEN_KEY);
    });
  }, [token]);

  useEffect(() => {
    if (authed) loadStats();
  }, [authed]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = loginInput.trim();
    if (!t) return;
    const ok = await api.adminCheck(t);
    if (ok) {
      localStorage.setItem(TOKEN_KEY, t);
      setToken(t);
      setAuthed(true);
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setAuthed(false);
    setLoginInput("");
    setFile(null);
    setReport(null);
    setError("");
  };

  const pickFile = (f: File | null | undefined) => {
    setReport(null);
    setError("");
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".xlsx")) {
      setError("Faqat .xlsx (Excel) fayl qabul qilinadi.");
      return;
    }
    setFile(f);
  };

  const doImport = async () => {
    if (!file || busy) return;
    setBusy(true);
    setError("");
    setReport(null);
    try {
      const r = await api.adminImport(token, file, type);
      setReport(r);
      setFile(null);
      if (fileInput.current) fileInput.current.value = "";
      loadStats();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import xatosi");
    } finally {
      setBusy(false);
    }
  };

  /* ---- Kirish oynasi ---- */
  if (!authed) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6 py-16">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-display text-[clamp(24px,4vw,32px)] font-semibold">
            Admin panel
          </h1>
          <p className="text-sub">
            {authed === null ? "Tekshirilmoqda…" : "Parolni kiriting"}
          </p>
        </div>
        {authed === false && (
          <form onSubmit={login} className="flex flex-col gap-3">
            <input
              type="password"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="Parol"
              autoFocus
              className="w-full rounded-xl border border-soft-200 bg-white-0 px-4 py-3 outline-none transition-colors focus:border-primary"
              aria-label="Parol"
            />
            {loginError && (
              <p className="text-error" role="alert">
                Parol noto'g'ri — qayta urinib ko'ring.
              </p>
            )}
            <button
              type="submit"
              className="rounded-xl bg-primary px-6 py-3 font-medium text-white-0 transition-colors hover:bg-primary-dark"
            >
              Kirish
            </button>
          </form>
        )}
      </div>
    );
  }

  /* ---- Asosiy panel ---- */
  return (
    <div className="flex w-full flex-col gap-8 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[clamp(24px,4vw,32px)] font-semibold">
          Admin panel
        </h1>
        <button
          onClick={logout}
          className="rounded-full border border-soft-200 px-4 py-1.5 font-medium text-sub transition-colors hover:border-error hover:text-error"
        >
          Chiqish
        </button>
      </div>

      {/* Joriy holat */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-soft-200 p-4 text-center">
            <span className="font-display text-2xl font-semibold">{stats.total}</span>
            <span className="text-sub">Jami birlik</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-soft-200 p-4 text-center">
            <span className="font-display text-2xl font-semibold text-primary">
              {stats.byType["allyuziv-nom"] ?? 0}
            </span>
            <span className="text-sub">Allyuziv nom</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-soft-200 p-4 text-center">
            <span className="font-display text-2xl font-semibold text-feature">
              {stats.byType["iqtibos"] ?? 0}
            </span>
            <span className="text-sub">Iqtibos</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-soft-200 p-4 text-center">
            <span className="font-display text-2xl font-semibold text-success-dark">
              {stats.byType["maqol"] ?? 0}
            </span>
            <span className="text-sub">Maqol</span>
          </div>
        </div>
      )}

      {/* Import bloki */}
      <section className="flex flex-col gap-5 rounded-2xl border border-soft-200 p-5 sm:p-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-xl font-semibold">Excel import</h2>
          <p className="text-sub">
            Fayl yuklansa, tanlangan turdagi barcha yozuvlar fayldagi yangi
            ma'lumot bilan <b>to'liq almashtiriladi</b>. Boshqa tur yozuvlariga
            tegilmaydi.
          </p>
        </div>

        {/* Tur tanlash */}
        <div className="grid gap-3 sm:grid-cols-3">
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`flex flex-col gap-1 rounded-2xl border p-4 text-left transition-colors ${
                type === t.value
                  ? "border-primary bg-primary-light/40"
                  : "border-soft-200 hover:border-disabled"
              }`}
              aria-pressed={type === t.value}
            >
              <span className="flex items-center gap-2 font-display font-semibold">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    type === t.value ? "border-primary" : "border-soft-200"
                  }`}
                  aria-hidden
                >
                  {type === t.value && (
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  )}
                </span>
                {TYPE_LABELS[t.value]}
              </span>
              <span className="pl-7 text-sub">{t.desc}</span>
            </button>
          ))}
        </div>

        {/* Fayl tanlash / tashlash zonasi */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            pickFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => fileInput.current?.click()}
          className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
            dragOver
              ? "border-primary bg-primary-light/40"
              : "border-soft-200 hover:border-primary/50"
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInput.current?.click();
            }
          }}
          aria-label="Excel fayl tanlash"
        >
          <svg className="h-8 w-8 text-soft" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 3 6 9h4v6h4V9h4l-6-6zM5 18v3h14v-3H5z" />
          </svg>
          {file ? (
            <p className="font-medium text-primary">{file.name}</p>
          ) : (
            <>
              <p className="font-medium">
                Excel faylni shu yerga tashlang yoki bosib tanlang
              </p>
              <p className="text-sub">.xlsx, 24 ustunli standart sxema</p>
            </>
          )}
          <input
            ref={fileInput}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
        </div>

        <button
          onClick={doImport}
          disabled={!file || busy}
          className="rounded-xl bg-primary px-6 py-3 font-medium text-white-0 transition-colors enabled:hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-disabled"
        >
          {busy ? "Yuklanmoqda…" : "Bazaga import qilish"}
        </button>

        {error && (
          <p className="rounded-xl bg-error-light px-4 py-3 text-error" role="alert">
            {error}
          </p>
        )}

        {report && (
          <div className="flex flex-col gap-2 rounded-xl bg-success-light px-4 py-3" role="status">
            <p className="font-medium text-success">
              Import muvaffaqiyatli: {report.imported} ta yozuv yuklandi
              ({report.complete} ta to'liq).
            </p>
            <p className="text-sub">
              Bazada endi jami {report.total} ta birlik:{" "}
              {report.byType["allyuziv-nom"] ?? 0} allyuziv nom,{" "}
              {report.byType["iqtibos"] ?? 0} iqtibos,{" "}
              {report.byType["maqol"] ?? 0} maqol.
            </p>
            {report.warnings.map((w, i) => (
              <p key={i} className="text-warning">
                {w}
              </p>
            ))}
          </div>
        )}
      </section>

      <p className="text-sub">
        Eslatma: kirish kaliti serverda <code>ADMIN_TOKEN</code> muhit
        o'zgaruvchisi orqali o'rnatiladi.
      </p>
    </div>
  );
}
