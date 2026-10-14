# Project Baseline

Generated: 2026-10-02T20:46:44.442Z

# Loyiha baseline — O‘zbek Intertekstual Tezaurusi

## 1) Assessment

### Mahsulot
Ulug‘bek Hamdam asarlaridagi intertekstual birliklarni izohlaydigan Uzbek tilidagi web-tezaurus:

- allyuziv nomlar;
- iqtiboslar;
- maqollar;
- manba, kontekst, tanilish darajasi, semantik maydon va munosabatlar;
- server tomonida qidiruv va matn tahlili;
- Excel orqali admin importi.

### Stack

| Qatlam | Texnologiya |
|---|---|
| Frontend | React 19, TypeScript, Vite 7 |
| Routing | React Router 7 |
| Styling | Tailwind CSS v4, CSS design tokens |
| Backend | Python, FastAPI, Uvicorn |
| Database | SQLite lokal, PostgreSQL `DATABASE_URL` orqali |
| Import | `openpyxl`, `.xlsx` |
| Search | `rapidfuzz`, markaziy Uzbek apostrof normalizatsiyasi |
| Production | FastAPI `frontend/dist` fayllarini serve qiladi |
| Deployment | Render Web Service + PostgreSQL, `render.yaml` |

Lockfile’dagi amaldagi dependency’lar Node.js 20+ talab qiladi. Vite, React Router va Tailwind paketlari package range’dan yangiroq versiyalarga resolve bo‘lgan.

### Arxitektura

```text
Browser
  └── React SPA
        └── /api/* fetch
              └── FastAPI routers
                    └── SQLite/PostgreSQL
                          └── startup’da yuklangan in-memory cache
```

Dataset hozir kichik bo‘lgani uchun barcha yozuvlar startup’da xotiraga olinadi. Bu 100–400 yozuv uchun maqbul; minglab yoki undan ko‘p yozuvlarda qayta ko‘rib chiqish kerak.

### Muhim backend modullar

- `backend/app/main.py` — FastAPI app, CORS, startup, routerlar, health, SPA serving.
- `backend/app/database.py` — SQLite/PostgreSQL tanlovi, schema, ulanish.
- `backend/app/db.py` — DB qatorlarini camelCase API obyektlariga aylantirish va cache.
- `backend/app/importer.py` — Excel parsing, cleaning, normalization va import replacement.
- `backend/app/normalize.py` — `clean()` va `normalize()` yagona manbasi.
- `backend/app/search.py` — exact, prefix, substring va fuzzy qidiruv.
- `backend/app/routers/entries.py` — katalog, filtrlar, detail, statistics.
- `backend/app/routers/search_router.py` — `/api/search`.
- `backend/app/routers/graph_router.py` — `/api/graph`, `/api/analyze`.
- `backend/app/routers/admin.py` — token-protected Excel import.

### Muhim frontend modullar

- `frontend/src/api.ts` — frontend API contract va TypeScript tiplari.
- `frontend/src/App.tsx` — route’lar va global layout.
- `frontend/src/pages/` — home, katalog, detail, statistika, tarmoq, tahlil, about, admin.
- `frontend/src/components/` — search, cards, modal, tooltip, select, badge, SVG node diagram.
- `frontend/src/index.css` — Tailwind importi, design tokens, typography, animation, print rules.

### Public API

Mavjud endpointlar:

```text
GET  /api/health
GET  /api/entries
GET  /api/entries/{id}
GET  /api/search?q=...
GET  /api/filters
GET  /api/stats
GET  /api/graph
POST /api/analyze
GET  /api/admin/check
POST /api/admin/import
```

Entry detail’ning asosiy public contract’i camelCase’da:

```text
id
type
unit
pronunciations
contextText
intertext
originalSource
recognition
commentary
semanticField
synonyms
synonymsLinked
hypernym
hyponym
note
isComplete
related
```

### Konvensiyalar

- Ichki Python kodida `snake_case`, public API’da camelCase.
- Entry type’lar:
  - `allyuziv-nom`
  - `iqtibos`
  - `maqol`
- ID prefikslar:
  - `an-`
  - `iq-`
  - `mq-`
- Recognition:
  - `yadro`
  - `periferiya`
  - bo‘sh string.
- Apostrof va whitespace normalizatsiyasi faqat `normalize.py` orqali bajariladi.
- Excel parsing faqat `importer.py`da saqlanadi.
- Incomplete entry’lar ko‘rsatiladi; bo‘sh section’lar UI’da yashiriladi.
- Barcha user-facing matn Uzbek tilida.
- UI’da raw ranglar emas, design tokenlar ishlatiladi.
- Audio hozircha disabled/future feature.

### Hozirgi arxitektura qarorlari

1. Lokal default — SQLite; production — `DATABASE_URL` bo‘lsa PostgreSQL.
2. Barcha entry type’lar umumiy `entries` jadvalida.
3. Admin import tanlangan type’ni to‘liq almashtiradi, boshqa type’larni saqlaydi.
4. Startup’da cache yuklanadi.
5. Graph native SVG bilan qurilgan.
6. Qidiruv server tomonida bajariladi.
7. `synonymsLinked` va `related` detail response extension field’lari hisoblanadi.
8. Yangi ORM yoki frontend state-management kutubxonasi kiritilmaydi.

### Aniqlangan hujjat-kod farqlari

- `ARCHITECTURE.md` `models.py`, `schemas.py`, `services/` tuzilmasini tasvirlaydi, lekin amaldagi kod raw SQL va `app/` modul tuzilmasidan foydalanadi.
- Amaldagi backend’da faqat `/api/analyze` request modeli Pydantic orqali berilgan; response schema’lar rasmiylashtirilmagan.
- `frontend/package.json`da `typecheck` script yo‘q.
- `frontend/src/api.ts` bor, lekin backend response validation mavjud emas.
- `render.yaml` mavjud; `Dockerfile`, `README.md`, `start.bat` ushbu tekshirilgan kontekstda ko‘rinmadi va alohida tasdiqlanishi kerak.
- Test suite va test dependency’lari ko‘rinmadi.

---

## 2) Concrete next task for Claude

### Task: baseline verification va contract audit

Yangi feature qo‘shilmasin. Avval faqat repository’ni tekshirsin va confirmed defect’larni alohida ro‘yxatlashtirsin.

#### 1. Environment va fayl audit

Quyidagilarni tekshirsin:

```bash
python --version
node --version
npm --version

find backend -maxdepth 3 -type f | sort
find frontend -maxdepth 3 -type f | sort
```

Mavjudligini tasdiqlasin:

```text
README.md
Dockerfile
render.yaml
start.bat
ARCHITECTURE.md
DESIGN_SYSTEM.md
```

#### 2. Backend verification

```bash
cd backend
python -m compileall app scripts
python scripts/import_excel.py
```

Importdan keyin SQLite’dagi sonlarni type bo‘yicha chiqarsin:

```bash
python - <<'PY'
import sqlite3
from app.database import SQLITE_PATH

con = sqlite3.connect(SQLITE_PATH)
print(con.execute("SELECT type, COUNT(*) FROM entries GROUP BY type ORDER BY type").fetchall())
print(con.execute("SELECT COUNT(*) FROM entries").fetchone())
con.close()
PY
```

Serverni ishga tushirib quyidagilarni tekshirsin:

```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

```bash
curl -i http://127.0.0.1:8000/api/health
curl -i "http://127.0.0.1:8000/api/entries?limit=5"
curl -i http://127.0.0.1:8000/api/filters
curl -i "http://127.0.0.1:8000/api/search?q=Navoiy"
curl -i http://127.0.0.1:8000/api/stats
curl -i http://127.0.0.1:8000/api/graph
curl -i http://127.0.0.1:8000/api/entries/an-1
curl -i -X POST http://127.0.0.1:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"Navoiy va Bobur haqida matn."}'
```

#### 3. Frontend verification

```bash
cd frontend
npm ci
npm run build
npx tsc --noEmit
```

`package.json`da `typecheck` yo‘qligini tasdiqlasa, alohida minimal change sifatida qo‘shsin:

```json
"typecheck": "tsc --noEmit"
```

Keyin:

```bash
npm run typecheck
npm run build
```

#### 4. Contract audit

Actual JSON response’larni `frontend/src/api.ts` bilan solishtirsin:

- `EntrySummary`;
- `EntryDetail`;
- `Filters`;
- `Stats`;
- `GraphData`;
- `AnalyzeResult`;
- `ImportReport`.

Ayniqsa tekshirilsin:

- `synonymsLinked`;
- `related`;
- `byType`;
- `score`;
- nullable va bo‘sh string qiymatlari;
- `maqol` type’ining real bazada mavjudligi.

#### 5. Audit report

Claude yakunida faqat quyidagilarni taqdim etsin:

1. Ishlatilgan buyruqlar.
2. Pass/fail natijalari.
3. Real entry count’lar.
4. API contract mismatch’lar.
5. Hujjat va kod farqlari.
6. Deploy uchun aniqlangan blocker’lar.
7. Keyingi implementation task’lari.

Bu auditda schema, import semantics yoki public API o‘zgartirilmasin.

---

## 3) Acceptance criteria

- Backend compile xatosiz tugaydi.
- Excel import deterministik ishlaydi va count’lar qayd etiladi.
- `/api/health` HTTP 200 qaytaradi.
- `/api/entries`, `/api/filters`, `/api/search`, `/api/stats`, `/api/graph` valid JSON qaytaradi.
- Mavjud entry detail endpointi 200, noma’lum ID 404 qaytaradi.
- `/api/analyze` valid request uchun ishlaydi.
- Frontend strict TypeScript tekshiruvi muvaffaqiyatli tugaydi.
- `npm run build` muvaffaqiyatli tugaydi.
- `typecheck` script mavjud bo‘ladi yoki yo‘qligi report’da aniq qayd etiladi.
- `maqol` type’i real source/database’da bor-yo‘qligi tasdiqlanadi.
- `ARCHITECTURE.md`dagi virtual `models.py`/`schemas.py` tuzilmasi amaldagi tree bilan solishtiriladi.
- `Dockerfile`, `README.md`, `start.bat` va `render.yaml` mavjudligi tasdiqlanadi.
- Public API field nomlari o‘zgartirilmaydi.
- Import replacement semantics o‘zgartirilmaydi.
- SQLite production data’si testlar orqali buzilmaydi.
- Audit yakunida qarorlar va blocker’lar decision log sifatida qayd etiladi.

---

## 4) Risks / notes

### Yuqori xavf

- `admin123` fallback token production uchun xavfli. Production’da `ADMIN_TOKEN` majburiy bo‘lishi kerak.
- Admin import tanlangan type yozuvlarini o‘chirib almashtiradi. Bu mavjud ma’lumot yo‘qolishi xavfini tug‘diradi.
- `rebuild()` jadvalni to‘liq o‘chiradi; faqat lokal deterministik import uchun ishlatilishi kerak.
- PostgreSQL schema’da migration mexanizmi yo‘q. `CREATE TABLE IF NOT EXISTS` ustun o‘zgarishlarini hal qilmaydi.
- Startup cache bir nechta worker ishlatilganda process’lar orasida sinxronlashmaydi.
- PostgreSQL bo‘sh bo‘lsa committed SQLite’dan seed qilinadi; SQLite eskirgan bo‘lsa stale data deploy qilinishi mumkin.
- Admin import fayl hajmi va workbook schema’si yetarlicha qat’iy tekshirilmagan.
- `rows_from_workbook()` 24 ustundan ortiq yoki noto‘g‘ri header’ni qat’iy reject qilmaydi.
- Frontend admin tokenni `localStorage`da saqlaydi; XSS holatida token ochilishi mumkin.
- Backend response schema’lari rasmiy emas, shu sababli frontend/backend contract drift xavfi bor.

### O‘rta xavf

- Vite, React Router va Tailwind lockfile versiyalari Node.js 20+ talab qiladi, lekin supported Node versiyasi hujjatlashtirilmagan.
- Qidiruv va `/api/analyze` barcha entry’larni xotirada skan qiladi.
- Graph sinonimlari asosan exact normalized unit match orqali bog‘lanadi.
- API xatolari ayrim frontend joylarda umumiy yoki jim yutiladi.
- Avtomatlashtirilgan regression testlar mavjud emas.
- Documentation’da eski yoki amaldagi kodga mos kelmaydigan modul nomlari bor.

### Kelajakdagi o‘zgarishlar qoidalari

1. Public endpoint va field nomlari backward-compatible saqlansin.
2. API o‘zgarsa `backend`, `frontend/src/api.ts`, Swagger va hujjatlar birga yangilansin.
3. Normalizatsiya faqat `backend/app/normalize.py`da amalga oshirilsin.
4. Excel cleaning `importer.py`dan tashqarida takrorlanmasin.
5. Import xatosi mavjud yozuvlarni qisman o‘chirib yubormasligi kerak.
6. Type replacement xatti-harakati alohida qarorsiz o‘zgartirilmasin.
7. Incomplete entry’lar yashirilmasin; bo‘sh field section’lari yashirilsin.
8. Design tokenlar o‘rniga component ichida tarqoq raw color ishlatilmasin.
9. Yangi ORM, graph library yoki state-management kutubxonasi alohida qarorsiz qo‘shilmasin.
10. Har bir schema, search, normalize, import yoki API contract o‘zgarishiga regression test qo‘shilsin.
11. Production security sozlamalari lokal fallback’lardan ajratilsin.
12. Har bir arxitektura qarori `ARCHITECTURE.md`, `DECISIONS.md` yoki task yakuniy log’ida qayd etilsin.
