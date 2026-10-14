# Current Task

Created: 2026-10-02T20:45:49.860Z

## User Goal
Loyihani mukammal qilamiz

## Project Manager Instructions
# TASK.md

## 1. Assessment

Loyiha hozirda backend API, Excel import, qidiruv, katalog, birlik sahifasi, semantik tarmoq va matn tahlili funksiyalariga ega. Arxitektura asosiy yo‘nalishlarda bajarilgan, ammo “mukammal” holatga chiqarishdan oldin barqarorlik, API kontraktlari, test qamrovi, xavfsizlik va deploy ishonchliligini mustahkamlash kerak.

Claude ushbu topshiriqda mavjud arxitekturani saqlashi kerak:

- Backend: FastAPI + SQLite/PostgreSQL.
- Frontend: React + TypeScript + Vite + Tailwind CSS v4.
- API javoblari frontend kutayotgan camelCase shaklida qoladi.
- Excel import mantig‘i `backend/app/importer.py` ichida yagona manbada qoladi.
- Backend frontend build fayllarini production rejimida tarqatish imkoniyati buzilmaydi.
- Mavjud URL’lar va route’lar backward-compatible bo‘lishi kerak.
- Mavjud ma’lumotlar yo‘qolmasligi kerak.

### Aniqlangan texnik e’tibor nuqtalari

1. Backend uchun avtomatlashtirilgan testlar ko‘rinmaydi.
2. API sxemalari `schemas.py` orqali rasmiylashtirilmagan; frontend kontrakti amalda qo‘lda saqlanmoqda.
3. SQLite/PostgreSQL uchun schema migratsiyasi yo‘q. Kelajakda ustun qo‘shilsa, deploy vaqtida mavjud baza buzilishi mumkin.
4. Admin import endpointi tanlangan turdagi barcha yozuvlarni o‘chirib almashtiradi. Bu xatti-harakat hujjatlashtirilgan, lekin backup yoki importdan oldingi himoya mexanizmi yo‘q.
5. Admin token uchun lokal standart `admin123` xavfsizlik riski tug‘diradi.
6. Frontend’da API xatolari va loading holatlari ayrim joylarda umumiy yoki jim yutiladi.
7. `/api/entries/{id}` javobi asosiy Entry sxemasiga `synonymsLinked` va `related` extension maydonlarini qo‘shadi. Bu aniq hujjatlashtirilishi kerak.
8. TypeScript type-check uchun alohida `typecheck` script mavjud emas.
9. Backend import, qidiruv, filtr, normalize va analyze funksiyalarining regressiya testlari yo‘q.
10. `ARCHITECTURE.md`, `README.md` va real kod orasidagi farqlarni tekshirish kerak. Xususan, `models.py`, `schemas.py` kabi eski reja bandlari hali ham hujjatlarda bo‘lishi mumkin.

---

## 2. Concrete next task for Claude

Claude quyidagi “stabilizatsiya va sifat nazorati” ishlarini bajarsin.

### A. Avval loyiha auditini bajarsin

Quyidagi buyruqlarni ishga tushirsin:

```bash
python --version
cd backend
python -m compileall app scripts
python scripts/import_excel.py
cd ../frontend
npm install
npm run build
npx tsc --noEmit
```

Agar buyruqlardan biri ishlamasa:

- xatoning to‘liq sababini aniqlasin;
- minimal arxitektura-mos tuzatish kiritsin;
- qayta ishga tushirib tekshirsin;
- natijani `TASK.md` yakuniy hisobotiga yozsin.

### B. Backend test infratuzilmasini qo‘shsin

`backend/tests/` katalogini yaratsin. Testlar kamida quyidagilarni qamrab olsin:

#### Normalize testlari

Tekshirilsin:

- `oʻ`, `o‘`, `o'`, ``o``, `o´` bir xil qidiruv qiymatiga kelishi;
- katta-kichik harf farqi yo‘qolishi;
- ortiqcha bo‘sh joylar siqilishi;
- `clean()` ko‘rsatish qiymatini buzmasligi.

#### Importer testlari

Sun’iy workbook yoki test fixture orqali tekshirilsin:

- faqat ID bo‘lgan qator tashlab yuborilishi;
- bo‘sh `unit` bo‘lgan qator import qilinmasligi;
- `yadro`, `Yadro`, `pereferiya`, `Pereferiya` birxillashtirilishi;
- talaffuzlar `//` va `/` orqali massivga ajratilishi;
- takroriy ID’lar yo‘qolmasligi va deterministik suffix olishi;
- apostrof variantli birliklar `unit_normalized` orqali bir xil qidirilishi;
- 24 ustunli sxema noto‘g‘ri bo‘lsa, xato aniq qaytarilishi;
- `is_complete` qiymati kutilgan qoidaga ko‘ra hisoblanishi.

#### Search testlari

Tekshirilsin:

- aniq birlik nomi eng yuqori natija bo‘lishi;
- prefiks mosligi ishlashi;
- apostrof va registr farqi ishlamasligi;
- talaffuz varianti orqali natija topilishi;
- sinonim va giperonim orqali qidiruv ishlashi;
- bo‘sh qidiruvda bo‘sh natija qaytishi;
- natija bo‘lmaganda maksimal 5 ta suggestion qaytishi;
- `limit` chegarasi ishlashi.

#### API testlari

FastAPI `TestClient` orqali tekshirilsin:

- `GET /api/health`;
- `GET /api/entries`;
- barcha filtrlar: `type`, `semantic_field`, `hypernym`, `recognition`, `work`, `letter`;
- `offset` va `limit`;
- `GET /api/entries/{id}`;
- mavjud bo‘lmagan ID uchun `404`;
- `GET /api/search`;
- `GET /api/filters`;
- `GET /api/stats`;
- `GET /api/graph`;
- `POST /api/analyze`;
- noto‘g‘ri yoki juda uzun analyze matni uchun validatsiya;
- admin endpointlarida noto‘g‘ri token uchun `401`.

Testlar real production SQLite faylini o‘zgartirmasligi kerak. Testlar uchun vaqtinchalik SQLite baza yoki in-memory fixture ishlatilsin.

### C. API kontraktlarini rasmiylashtirsin

Backend’da Pydantic response modellari qo‘shilsin yoki mavjud endpointlar Pydantic sxemalari bilan rasmiylashtirilsin.

Kamida quyidagi sxemalar bo‘lsin:

- `EntrySummary`;
- `IntertextInfo`;
- `OriginalSource`;
- `SynonymLink`;
- `EntryDetail`;
- `EntriesResponse`;
- `SearchResponse`;
- `FiltersResponse`;
- `StatsResponse`;
- `GraphResponse`;
- `AnalyzeResponse`;
- `ImportReport`.

Talablar:

- JSON field nomlari frontend kutayotgan camelCase shaklida qolishi kerak;
- `EntryDetail` ichidagi `synonymsLinked` va `related` extension maydonlari rasmiy sxemada aks etsin;
- mavjud API field nomlari o‘zgartirilmasin;
- nullable va bo‘sh string xatti-harakati aniq belgilanadi;
- Swagger `/docs` orqali javob sxemalari ko‘rinsin.

### D. Database readiness va migratsiyani xavfsiz qilsin

`backend/app/database.py` va tegishli kodni tekshirsin:

1. SQLite fayli mavjud bo‘lmasa, server startup xatosi tushunarli bo‘lsin.
2. PostgreSQL bo‘sh bo‘lsa, seed SQLite’dan ko‘chirish ishlasin.
3. PostgreSQL’da schema mavjud bo‘lganda qayta startup duplicate ma’lumot kiritmasin.
4. SQLite/PostgreSQL ustunlar ro‘yxati bir xil bo‘lsin.
5. Kelajakdagi schema o‘zgarishlari uchun kamida versiya tekshiruvi yoki aniq migration strategiyasi belgilang.
6. Har qanday migration mavjud ma’lumotlarni o‘chirib yubormasin.
7. Import tranzaksiyasi xato bo‘lsa, eski yozuvlar saqlanib qolsin.

Agar to‘liq migration tizimi ushbu bosqich uchun ortiqcha bo‘lsa, kamida quyidagilarni amalga oshirsin:

- schema version metadata;
- missing-column migration;
- migration log;
- idempotent startup.

### E. Admin xavfsizligini mustahkamlash

Quyidagilarni bajarsin:

- `ADMIN_TOKEN` production’da majburiy bo‘lsin;
- faqat lokal development rejimida fallback token ishlasin;
- fallback token ishlatilganda server log yoki health javobida maxfiy tokenni ko‘rsatmasdan warning berilsin;
- README’da production uchun `ADMIN_TOKEN` talab qilinishi aniq yozilsin;
- admin import fayl hajmiga limit qo‘yilsin;
- import faqat `.xlsx` bo‘lishi bilan cheklanib qolmasdan, workbook strukturasi ham tekshirilsin;
- importdan oldin yoki import jarayonida noto‘g‘ri fayl sababli mavjud ma’lumotlar yo‘qolmasin;
- admin endpointlarida exception tafsilotlari foydalanuvchiga sizib chiqmasin.

### F. Frontend quality gate qo‘shsin

`frontend/package.json` ichiga quyidagi scriptlar qo‘shilsin:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  }
}
```

Frontend tekshirilsin:

- `npm run typecheck` muvaffaqiyatli tugashi;
- `npm run build` muvaffaqiyatli tugashi;
- barcha route’lar ishlashi;
- `/birlik/:id` sahifasi refresh qilinganda production SPA fallback ishlashi;
- API xatosida foydalanuvchiga tushunarli holat ko‘rsatilishi;
- `SearchBox`, `CatalogPage`, `EntryPage`, `AdminPage` loading/error holatlari crash qilmasligi;
- bo‘sh fieldlar uchun ortiqcha bo‘sh bloklar chiqmasligi;
- modal ochilganda va yopilganda fokus/keyboard xatti-harakati buzilmasligi;
- mobil layout’da horizontal overflow bo‘lmasligi.

### G. API va frontend hujjatlarini sinxronlashtirsin

Quyidagilarni tekshirib yangilasin:

- `ARCHITECTURE.md`;
- `README.md`;
- `DESIGN_SYSTEM.md`;
- frontend API type’lari;
- Swagger endpoint tavsiflari.

Hujjatlarda quyidagilar aniq bo‘lsin:

- real qo‘llab-quvvatlanadigan entry turlari;
- `maqol` turi mavjudligi;
- API response field’lari;
- importning “replace selected type” xatti-harakati;
- incomplete entry’lar saytda ko‘rsatilishi;
- audio hozircha disabled ekanligi;
- lokal va production ishga tushirish buyruqlari;
- testlarni ishga tushirish buyruqlari.

### H. Regression checklist bilan yakuniy smoke test bajarsin

Backend serverni ishga tushirib:

```bash
cd backend
python -m uvicorn app.main:app --port 8000
```

Quyidagilarni tekshirsin:

```bash
curl http://127.0.0.1:8000/api/health
curl "http://127.0.0.1:8000/api/entries?limit=5"
curl "http://127.0.0.1:8000/api/search?q=Navoiy"
curl http://127.0.0.1:8000/api/filters
curl http://127.0.0.1:8000/api/stats
curl http://127.0.0.1:8000/api/graph
```

`POST /api/analyze` uchun JSON request yuborilsin:

```bash
curl -X POST http://127.0.0.1:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"Navoiy va Bobur haqida matn.\"}"
```

Frontend uchun:

```bash
cd frontend
npm run typecheck
npm run build
```

Agar browser automation mavjud bo‘lsa, quyidagi sahifalar ochilsin:

- `/`;
- `/katalog`;
- `/birlik/an-1` yoki mavjud boshqa ID;
- `/statistika`;
- `/tarmoq`;
- `/tahlil`;
- `/haqida`;
- `/admin`.

---

## 3. Acceptance criteria

Ish faqat quyidagi shartlarning barchasi bajarilganda qabul qilinadi.

### Backend

- [ ] `python -m compileall backend/app backend/scripts` xatosiz tugaydi.
- [ ] Backend testlari xatosiz tugaydi.
- [ ] Normalize, importer, search, filters, analyze va admin auth test bilan qoplangan.
- [ ] `GET /api/health` `status: "ok"` qaytaradi.
- [ ] `/api/entries` mavjud field nomlarini o‘zgartirmaydi.
- [ ] `/api/entries/{id}` mavjud ID uchun 200, noma’lum ID uchun 404 qaytaradi.
- [ ] `/api/search?q=Navoiy` natija qaytaradi yoki bazada yo‘q bo‘lsa deterministic suggestions qaytaradi.
- [ ] Apostrof variantlari va registr farqlari qidiruvda bir xil ishlaydi.
- [ ] `/api/filters` qiymatlarni normalize qilingan guruhlar bo‘yicha takrorlamaydi.
- [ ] `/api/analyze` pozitsiyalarni to‘g‘ri qaytaradi.
- [ ] Admin endpoint noto‘g‘ri token bilan 401 qaytaradi.
- [ ] Import xatosi mavjud yozuvlarni qisman o‘chirib yubormaydi.
- [ ] PostgreSQL startup seed jarayoni idempotent.
- [ ] Swagger’da response schema’lar ko‘rinadi.

### Frontend

- [ ] `npm run typecheck` muvaffaqiyatli.
- [ ] `npm run build` muvaffaqiyatli.
- [ ] Barcha mavjud route’lar compile bo‘ladi.
- [ ] `/katalog` filtrlar bilan ishlaydi.
- [ ] Qidiruv autocomplete ishlaydi.
- [ ] Birlik sahifasida lug‘at va uzellar ko‘rinishi almashadi.
- [ ] Bo‘sh ma’lumotlar uchun bo‘sh section chiqmaydi.
- [ ] API 4xx/5xx holatida frontend oq ekran bilan qulamaydi.
- [ ] Mobil ko‘rinishda asosiy sahifalarda horizontal scroll paydo bo‘lmaydi.
- [ ] Production build backend orqali tarqatilganda SPA route refresh ishlaydi.
- [ ] Audio tugmasi hozircha disabled va “tez orada” ma’nosida qoladi.

### Hujjatlar

- [ ] README real ishga tushirish buyruqlariga mos.
- [ ] ARCHITECTURE.md real endpointlar va entry turlariga mos.
- [ ] Admin importning replace xatti-harakati hujjatlashtirilgan.
- [ ] Testlarni ishga tushirish buyruqlari README’da bor.
- [ ] Qabul qilingan qarorlar `DECISIONS.md` yoki TASK.md yakuniy bo‘limida qayd etilgan.

### Yakuniy hisobot

Claude yakunida quyidagilarni yozsin:

1. O‘zgartirilgan fayllar ro‘yxati.
2. Ishga tushirilgan buyruqlar.
3. Test natijalari.
4. Aniqlangan va hal qilingan muammolar.
5. Qolgan texnik qarzlar.
6. API kontraktida o‘zgarish bo‘lgan-bo‘lmaganligi.
7. Deploy uchun alohida qo‘shimcha sozlama kerak yoki kerak emasligi.

---

## 4. Risks / Notes

### Yuqori xavfli nuqtalar

- Import logikasi mavjud bazadagi tanlangan tur yozuvlarini to‘liq almashtiradi. Bu xatti-harakatni o‘zboshimchalik bilan append rejimiga o‘zgartirmaslik kerak.
- API field nomlarini snake_case’ga o‘zgartirish frontendni buzadi.
- `unit`, `id`, `type`, `intertext`, `originalSource` field’lari backward-compatible qolishi kerak.
- SQLite seed faylini testlar vaqtida o‘zgartirmaslik kerak.
- PostgreSQL ma’lumotlari deploy vaqtida qayta seed qilinib, mavjud ma’lumotlar ustiga duplicate kiritilmasligi kerak.
- `ADMIN_TOKEN` qiymatini source code, README yoki log’larda chiqarish mumkin emas.
- Frontend’da API xatosini jim yutish foydalanuvchini noaniq holatda qoldiradi; kamida umumiy error state bo‘lishi kerak.
- Node diagram SVG chiziqlarini to‘liq qayta yozish shart emas; faqat regression yoki resize muammosi aniqlansa tuzatilsin.
- Dizaynni katta miqyosda almashtirmaslik kerak. Align UI tokenlari va mavjud vizual til saqlansin.
- Audio funksiyasi ushbu topshiriq doirasida implement qilinmaydi; faqat disabled holat saqlanadi.

### Qabul qilingan qarorlar

- Incomplete iqtibos yozuvlari saytda ko‘rsatiladi; mavjud bo‘lmagan bloklar render qilinmaydi.
- Qidiruv backend’da qoladi.
- Apostrof normalizatsiyasi bitta markaziy `normalize()` funksiyasi orqali bajariladi.
- `related`, `synonymsLinked` kabi ma’lumotlar Entry detail response’ining rasmiy extension field’lari hisoblanadi.
- Audio birinchi bosqichda keyinga qoldiriladi.
- Admin import tanlangan entry turini replace qiladi, boshqa turlarni saqlab qoladi.
- Ushbu topshiriqda yangi ORM yoki yangi frontend state-management kutubxonasi qo‘shilmaydi.

