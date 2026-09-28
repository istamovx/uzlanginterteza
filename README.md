# O‘ZBEK INTERTEKSTUAL TEZAURUSI

Ulug'bek Hamdam asarlaridagi allyuziv nomlar, iqtiboslar va maqollarning izohli web-tezaurusi.
Arxitektura: [ARCHITECTURE.md](ARCHITECTURE.md) · Dizayn: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)

## Texnologik stek

| Qatlam | Texnologiya |
|---|---|
| **Frontend** | **React 19** + **TypeScript**, **Vite 7** (build vositasi), **Tailwind CSS v4** (Align UI tokenlari), **React Router 7** (SPA marshrutlash) |
| **Backend** | **Python 3.12** + **FastAPI** (ASGI), **Uvicorn** server; qo'shimcha: `rapidfuzz` (noaniq qidiruv), `openpyxl` (Excel import) |
| **Ma'lumotlar bazasi** | **PostgreSQL 16** — internetda (Render); **SQLite** — lokal ishlab chiqishda. Tanlov `DATABASE_URL` muhit o'zgaruvchisi orqali avtomatik, kod bir xil (`psycopg` / `sqlite3`) |
| **Ma'lumot almashinuvi** | **REST API** — HTTP + JSON, `/api/...` endpointlari; OpenAPI (Swagger) hujjati `/docs` da avtomatik |
| **Hosting** | **Render.com**: **Web Service** (Docker) + **PostgreSQL Database**; konfiguratsiya `render.yaml` (Blueprint) da |

**Ma'lumot oqimi:** Brauzer (React) → `fetch('/api/...')` → FastAPI → PostgreSQL.
Frontend build (`frontend/dist`) ni ham shu FastAPI server tarqatadi — sayt va API
bitta domen va bitta servisda ishlaydi (CORS kerak emas).

REST API endpointlari:

| Metod | Yo'l | Vazifasi |
|---|---|---|
| GET | `/api/entries` | Birliklar ro'yxati (filtr: tur, semantik maydon, giperonim, asar, harf) |
| GET | `/api/entries/{id}` | Bitta birlik to'liq + bog'langan sinonimlar va o'xshash birliklar |
| GET | `/api/search?q=` | Qidiruv (apostrof va talaffuz variantlariga chidamli) |
| GET | `/api/filters` | Filtr qiymatlari va sonlari |
| GET | `/api/stats` | Statistika |
| GET | `/api/graph` | Semantik tarmoq (tugunlar va bog'lar) |
| POST | `/api/analyze` | Matndagi intertekstual birliklarni topish |
| POST | `/api/admin/import` | Excel import (admin, `X-Admin-Token` bilan) |
| GET | `/api/health` | Server va baza holati (Render health check) |

## Ishga tushirish

Eng oson yo'l — **`start.bat`** faylini ikki marta bosing: server 8000-portda
ko'tariladi va brauzerda http://127.0.0.1:8000 ochiladi. Qo'lda ishga tushirish
bosqichlari quyida.

### 1. Ma'lumotni import qilish (Excel yangilanganda ham shu)

```
cd backend
pip install -r requirements.txt
python scripts/import_excel.py
```

Standart holda `excel-manba/` papkasidagi uchta faylni oladi:
`ilova allyuziv nom.xlsx`, `ilova Iqtibos.xlsx`, `Maqol ilovam.xlsx`.
Boshqa joydan olish uchun:
`python scripts/import_excel.py <allyuziv.xlsx> <iqtibos.xlsx> <maqol.xlsx>`
Import tugagach serverni qayta ishga tushiring — yangi ma'lumot ko'rinadi.

### 2. Backend (API)

```
cd backend
python -m uvicorn app.main:app --port 8000
```

Swagger hujjatlar: http://127.0.0.1:8000/docs

### 3. Frontend (ishlab chiqish rejimi)

```
cd frontend
npm install
npm run dev
```

Sayt: http://localhost:5173 (API so'rovlari 8000-portga proxy qilinadi)

### Production

```
cd frontend && npm run build
cd ../backend && python -m uvicorn app.main:app --port 8000
```

`frontend/dist` mavjud bo'lsa, backend o'zi saytni ham tarqatadi —
http://127.0.0.1:8000 da to'liq sayt ishlaydi (bitta server yetadi).

## Admin panel (Excel import saytdan)

`/admin` sahifasi orqali administrator Excel faylni yuklab bazani yangilaydi —
terminal shart emas (footer'dagi "Admin" havolasi).

- Kirish paroli quyidagi tartibda olinadi: `ADMIN_TOKEN` muhit o'zgaruvchisi →
  `backend/data/admin_token.txt` fayli (git'ga kirmaydi) → standart `admin123`.
  O'z parolingizni o'rnatish uchun `backend/data/admin_token.txt` faylini
  yaratib, ichiga parolni yozing; deploy'da esa `ADMIN_TOKEN` ni o'rnating.
- Import tanlangan turdagi (allyuziv nom / iqtibos / maqol) **barcha** yozuvlarni
  fayldagi yangi ma'lumot bilan almashtiradi; boshqa turga tegilmaydi.
- Fayl 24 ustunli standart sxemada bo'lishi kerak (mavjud ilova fayllari kabi).
- Noto'g'ri tur tanlansa tizim ogohlantiradi (fayl ichidagi yorliqlar bo'yicha).

## Internetga joylash (deploy) — Render

Repoda tayyor **`render.yaml`** (Render Blueprint) bor. U ikkita servisni birga yaratadi:

| Servis | Turi | Vazifasi |
|---|---|---|
| `tezaurus-web` | **Web Service** (Docker, `Dockerfile`) | Frontend build + FastAPI: sayt va REST API |
| `tezaurus-db` | **PostgreSQL Database** (v16) | Barcha birliklar; admin import shu yerda saqlanadi |

**Birinchi marta sozlash:**

1. Render → **New → Blueprint** → `istamovx/uzlanginterteza` repozitoriysini tanlang.
2. Render `ADMIN_TOKEN` qiymatini so'raydi — admin panel uchun o'z parolingizni kiriting.
3. **Apply** — Render bazani, keyin web servisni yaratadi. `DATABASE_URL` avtomatik ulanadi.
4. Birinchi ishga tushishda bo'sh PostgreSQL repodagi `backend/data/tezaurus.db`
   dan avtomatik to'ldiriladi (433 ta birlik). Tekshirish: `https://<sayt>/api/health`
   → `{"database": "postgresql", ...}`.

Keyingi har bir `git push` (main) avtomatik qayta deploy qiladi. Baza deploy'lar
orasida saqlanadi — admin paneldan yuklangan ma'lumot yo'qolmaydi.

**Ma'lumotni yangilash:** internetdagi saytda — `/admin` sahifasidan Excel yuklash
(tavsiya etiladi). Lokal nusxa uchun — `python scripts/import_excel.py`.

> Eslatma: Render'ning bepul PostgreSQL bazasi cheklangan muddatga beriladi;
> muddati tugashidan oldin pullik tarifga o'tkazish kerak (Render → Database → Upgrade).
> Bepul web servis 15 daqiqa harakatsizlikdan keyin "uxlaydi" — birinchi so'rov ~30–60 s oladi.

Boshqa variantlar: **VPS** — `docker build -t tezaurus . && docker run -p 80:8000 -e DATABASE_URL=... tezaurus`
(`DATABASE_URL` berilmasa, konteyner ichidagi SQLite ishlatiladi).

## Tuzilma

```
backend/
  app/            FastAPI ilova (main, database, db, importer, search, normalize, routers/)
  scripts/        import_excel.py — Excel → baza (SQLite yoki DATABASE_URL bo'yicha PostgreSQL)
  data/           tezaurus.db — SQLite; PostgreSQL uchun boshlang'ich ma'lumot manbai
render.yaml       Render Blueprint: Web Service + PostgreSQL
frontend/
  src/            React + TypeScript + Tailwind v4 (Align UI tokenlari)
    components/   Header, SearchBox, EntryCard, Badge, TooltipLink, NodeDiagram...
    pages/        Home, Entry (lug'at + uzellar), Catalog, About
```
