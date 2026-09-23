# O‘ZBEK INTERTEKSTUAL TEZAURUSI

Ulug'bek Hamdam asarlaridagi allyuziv nomlar, iqtiboslar va maqollarning izohli web-tezaurusi.
Arxitektura: [ARCHITECTURE.md](ARCHITECTURE.md) · Dizayn: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)

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

## Internetga joylash (deploy)

Loyihada tayyor **Dockerfile** bor — bitta konteyner frontend'ni build qilib,
FastAPI orqali sayt + API'ni birga tarqatadi. Baza (`backend/data/tezaurus.db`)
konteyner ichiga kiradi, alohida baza-server kerak emas.

1. **Render.com** (bepul tarif bor) — loyihani GitHub'ga yuklang, Render'da
   *New Web Service* → repo tanlang → Environment: **Docker**. Boshqa sozlama shart emas.
2. **Railway.app** — xuddi shunday, Dockerfile'ni o'zi topadi.
3. **VPS** — `docker build -t tezaurus . && docker run -p 80:8000 tezaurus`

Ma'lumot yangilanganda lokalda `import_excel.py` ni qayta ishlating va yangi
`tezaurus.db` bilan qayta deploy qiling.

## Tuzilma

```
backend/
  app/            FastAPI ilova (main, db, search, normalize, routers/)
  scripts/        import_excel.py — Excel → SQLite
  data/           tezaurus.db (generatsiya qilinadi)
frontend/
  src/            React + TypeScript + Tailwind v4 (Align UI tokenlari)
    components/   Header, SearchBox, EntryCard, Badge, TooltipLink, NodeDiagram...
    pages/        Home, Entry (lug'at + uzellar), Catalog, About
```
