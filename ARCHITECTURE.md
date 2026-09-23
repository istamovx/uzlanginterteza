# O‘ZBEK INTERTEKSTUAL TEZAURUSI — Arxitektura

Ulug'bek Hamdam asarlaridagi **allyuziv nomlar** va **iqtiboslar**ni izohlab beruvchi
interaktiv web-tezaurus. Foydalanuvchi birlikni qidiradi va uning ma'nosi, kelib chiqishi
(asl manbasi), kontekstual sinonimi, giperonim/giponimi, kontekstual sharhini bitta
chiroyli sahifada ko'radi (UY/OILA skrinshotlaridagi uslubda).

Har bir birlik **uzellar tizimi** asosida tavsiflanadi ("Layli va Majnun" diagrammasidagi
model) — bu ilmiy model saytdagi birlik sahifasining rasmiy strukturasi hisoblanadi:

```
Birlik
├── Intertekstual birlik  → Allyuziv nom/Iqtibos, Talaffuz
├── Intertekstual matn    → Matn, Muallif, Asar, Janr, Davr, Nashriyot, Sahifa
├── Asl manba             → Muallif, Asar, Janr, Nashriyot, Davr
├── Tanilish darajasi     → yadro / periferiya
├── Kontekstual sharh
├── Semantik maydon
├── Semantik munosabat    → Kontekstual sinonim, Giperonim, Giponim
└── Izoh
```

---

## 1. Ma'lumotlar tahlili (Excel fayllar)

### ilova allyuziv nom.xlsx
- **50 ta yozuv**, 24 ta mazmunli ustun. Asosiy maydonlar 100% to'ldirilgan.
- Asl manba ustunlari qisman bo'sh (Muallif 44/50, Janr 35/50) — tarixiy shaxslarda
  "asar" bo'lmasligi tabiiy.
- Semantik maydonlar: Badiiy (32), Tarixiy (14), Diniy (2), Aralash (2).

### ilova Iqtibos.xlsx
- 58 qator, shundan **53 ta haqiqiy yozuv** (oxirgi 5 qatorda faqat ID bor — texnik qoldiq).
- ID 33–53 oralig'idagi **21 ta yozuvda faqat asosiy qism to'ldirilgan** (birlik, matn,
  asar, sahifa), asl manba / sharh / semantik maydon / izoh hali kiritilmagan —
  ma'lumot to'ldirilishi davom etyapti deb hisoblaymiz.
- Semantik maydonlar: Ijtimoiy-falsafiy (15), Siyosiy (10), Diniy (6).

### Umumiy sxema (ikkala fayl bir xil)
24 ustun, mantiqan 5 blokka bo'linadi:

| Blok | Ustunlar |
|---|---|
| Birlik | ID, Intertekstual birlik, Allyuziv nom / Iqtibos, Talaffuzi |
| Intertekst (qayerda uchraydi) | Intertekstual matn, Muallif, Asar, Janr, Davr, Nashriyot, Sahifa |
| Asl manba (kelib chiqishi) | Asl Manba (tavsif), Muallif, Asar, Janr, Nashriyot, Davr |
| Lingvistik tavsif | Tanilish darajasi, Semantik maydon, Sinonim, Giperonim, Giponim |
| Sharh | Kontekstual sharh, Izoh |

### Tozalash kerak bo'lgan muammolar (konvertorda avtomatik hal qilinadi)
1. **Takror ustun nomlari** — Muallif/Asar/Janr/Nashriyot/Davr ikki marta keladi
   (intertekst asari vs asl manba). JSON'da alohida obyektlarga ajratiladi.
2. **Registr nomuvofiqligi** — `Yadro` / `yadro`, `pereferiya` / `Pereferiya` → bitta
   qiymatga keltiriladi (`yadro` / `periferiya`).
3. **Semantik maydon variantlari** — `diniy mavzudagi...` / `Diniy mavzudagi...` → birxillashtirish.
4. **Ortiqcha probellar** — `Ulug‘bek Hamdam ` kabi trailing space'lar → trim.
5. **Apostrof xilma-xilligi** — `oʻ`, `o‘`, `o'`, `o'` aralash ishlatilgan → qidiruv uchun
   normallashtirilgan maydon yaratiladi (ko'rsatishda asl shakl saqlanadi).
6. **Bo'sh qatorlar** — Iqtibos faylidagi 5 ta faqat-ID qator tashlab yuboriladi.
7. **Talaffuz variantlari** — `Navoiy//Navoyi//Navoi` ko'rinishida `//` bilan ajratilgan →
   massivga bo'linadi (bu variantlar qidiruvda ham ishlaydi — foydalanuvchi "Navoi" deb
   yozsa ham topiladi).

---

## 2. Texnologik stek

| Qatlam | Tanlov | Sabab |
|---|---|---|
| Backend | **Python + FastAPI** | Til bilan ishlashda kuchli ekotizim (normalizatsiya, fuzzy qidiruv, keyinchalik NLP); avtomatik API hujjatlar (Swagger) |
| Baza | **SQLite** | ~103 yozuv uchun yetarli, alohida server talab qilmaydi, bitta fayl; kelajakda PostgreSQL'ga o'tish oson |
| Import | **openpyxl** bilan import skripti | Excel → tozalash → SQLite; fayl yangilanganda qayta ishga tushiriladi |
| Qidiruv | **rapidfuzz** (server tomonda, fuzzy) | Apostrof/imlo farqlariga chidamli; Python'da normalizatsiya markazlashadi |
| Frontend | **React + Vite + TypeScript** | Komponentli UI, tez dev-server, dizayn-sistemani qulay joriy qilish |
| Dizayn | **Align UI 2.0** + Tailwind CSS v4 | Foydalanuvchi bergan Figma dizayn-sistema; tokenlar DESIGN_SYSTEM.md'da |
| Routing | React Router | Har bir birlikning o'z URL'i bo'ladi — ulashish mumkin |
| Deploy | Backend: Render / Railway / PythonAnywhere / VPS; Frontend: shu backend'dan static sifatida yoki Netlify | FastAPI static fayllarni ham o'zi tarqata oladi — bitta server yetadi |

**Nega backend bilan:** til bo'yicha ishlov (talaffuz variantlarini qidiruvga qo'shish,
o'zbek apostrof normalizatsiyasi, fuzzy moslik, keyinchalik lemmatizatsiya/NLP) Python'da
mustahkam bo'ladi va barcha mantiq bir joyda turadi. Ma'lumot kengayishi (yangi
mualliflar, minglab birlik) yoki admin-panel qo'shilishi ham backend'ni talab qiladi.

### Backend tuzilishi

```
backend/
├── app/
│   ├── main.py            # FastAPI ilova, CORS, static
│   ├── models.py          # SQLAlchemy modellari (Entry)
│   ├── schemas.py         # Pydantic sxemalar (API javoblari)
│   ├── routers/
│   │   ├── entries.py     # /api/entries endpointlari
│   │   └── search.py      # /api/search
│   ├── services/
│   │   ├── normalize.py   # apostrof/registr normalizatsiyasi (uz-lotin)
│   │   └── search.py      # rapidfuzz qidiruv mantiqi
│   └── db.py              # SQLite ulanish
├── scripts/
│   └── import_excel.py    # Excel → SQLite (tozalash shu yerda)
├── data/
│   └── tezaurus.db
└── requirements.txt
```

### API endpointlar

| Metod | Yo'l | Vazifa |
|---|---|---|
| GET | `/api/entries` | Ro'yxat + filtrlar (`?type=`, `?semantic_field=`, `?hypernym=`, `?recognition=`, `?work=`, `?letter=`) va sahifalash |
| GET | `/api/entries/{id}` | Bitta birlikning to'liq ma'lumoti (uzellar tizimi bo'yicha) |
| GET | `/api/search?q=...` | Fuzzy qidiruv: unit, talaffuz variantlari, sinonimlar bo'yicha; normalizatsiya bilan |
| GET | `/api/filters` | Mavjud filtr qiymatlari (semantik maydonlar, giperonimlar, asarlar) — UI dropdownlari uchun |
| GET | `/api/stats` | Statistika sahifasi uchun sonlar (ixtiyoriy) |

---

## 3. Ma'lumot sxemasi (bitta birlik — API javobi / baza yozuvi)

```json
{
  "id": "an-1",
  "type": "allyuziv-nom",            // yoki "iqtibos"
  "unit": "Sherlok Xolms",           // ko'rsatiladigan asl shakl
  "unitNormalized": "sherlok xolms", // qidiruv uchun (apostroflar birxillashtirilgan)
  "pronunciations": ["Sherlk Xolms"],
  "contextText": "Sherlok Xolms bo‘p ket-ey!",
  "intertext": {
    "author": "Ulug‘bek Hamdam",
    "work": "Sabo va Samandar",
    "genre": "Roman",
    "year": "2025",
    "publisher": "Oltin qalam",
    "page": "235-b"
  },
  "originalSource": {
    "description": "Konan Doyl hikoyalarining bosh qahramoni, izquvar",
    "author": "Konan Doyl",
    "work": "A Study in Scarlet",
    "genre": "Detektiv roman",
    "publisher": "Ward Lock Co",
    "period": "XIX asr oxiri XX asr boshlari"
  },
  "recognition": "yadro",            // "yadro" | "periferiya"
  "commentary": "Dialog vaziyatida personajning topqirligini hazilomuz baholash.",
  "semanticField": "Badiiy allyuziv nomlar",
  "synonyms": ["Erkyul Puaro"],       // kontekstual sinonimlar
  "hypernym": "Adabiy qahramon va obraz",
  "hyponym": "Sherlok Xolms",
  "note": "Intertekst mashhur pretsedent obraz..."
}
```

Ikkala Excel bitta `entries` jadvaliga import qilinadi, `type` maydoni farqlaydi.
API javoblari aynan shu shaklda qaytadi (Pydantic sxema), shuning uchun frontend
baza tuzilishidan mustaqil.

---

## 4. Sahifalar va UI tuzilishi

### 4.1. Bosh sahifa `/`
- Katta qidiruv maydoni (markazda) — yozgan sari jonli natijalar (autocomplete).
- Turi bo'yicha ikkita katta karta: **Allyuziv nomlar (50)** / **Iqtiboslar (53)**.
- Semantik maydon bo'yicha tez filtrlar (chip'lar).
- Alifbo indeksi (A B D E ...) — bosilganda ro'yxat ochiladi.

### 4.2. Birlik sahifasi `/birlik/:id` — uzellar tizimi asosida
Ikki xil ko'rinish (tugma bilan almashtiriladi):

**A. Lug'at ko'rinishi** (asosiy, UY/OILA skrinshotlari uslubida) — yuqoridan pastga:
1. **Sarlavha bloki**: birlik nomi (katta), talaffuz variantlari, 🔊 audio tugma,
   🖨 chop etish tugmasi, turi/tanilish darajasi badge'lari.
2. **Soha** — semantik maydon (OILA skrinshotidagi "Soha:" qatoriga o'xshash).
3. **Izoh** — asl manba tavsifi (`originalSource.description`).
4. **Namuna** — intertekstual matn (kursiv) + manba havolasi (Muallif. Asar, yil, sahifa).
5. **Asl manba** — muallif, asar, janr, davr, nashriyot (karta ko'rinishida).
6. **Kontekstual sharh** — matnda qanday vazifa bajarayotgani.
7. **Semantik munosabat**:
   - **Kontekstual sinonimlar** — bosiladigan havolalar (bazada bo'lsa o'sha sahifaga
     o'tadi; bo'lmasa hover'da tooltip);
   - **Giperonim** — bosilganda o'sha guruhga mansub barcha birliklar ro'yxati;
   - **Giponim**.
8. **Izoh (lingvistik)** — kengaytirilgan tahliliy izoh.
9. Skrinshotlardagi kabi **hover-tooltip**: ro'yxatdagi havola ustiga borilganda
   mini-karta (Namuna + Izoh) chiqadi.

**B. Uzellar (tezaurus) ko'rinishi** — "Layli va Majnun" diagrammasidagi kabi interaktiv
sxema: markazda birlik, atrofida uzellar (Intertekstual birlik, Intertekstual matn,
Asl manba, Tanilish darajasi, Kontekstual sharh, Semantik maydon, Semantik munosabat,
Izoh) kartochkalar sifatida chiziqlar bilan bog'lanadi. Ilmiy taqdimot va dissertatsiya
rasmlariga mos vizual — SVG bilan chiziladi, alohida kutubxona shart emas.

### 4.3. Katalog `/katalog`
- Barcha birliklar jadval/karta ko'rinishida.
- Filtrlar: turi, semantik maydon, giperonim, tanilish darajasi, asar.
- Saralash: alifbo, ID.

### 4.4. Loyiha haqida `/haqida`
- Tadqiqot, manba korpus (Ulug'bek Hamdam asarlari), metodologiya haqida qisqa ma'lumot.

### Komponentlar daraxti
```
App
├── Layout (Header: logo + qidiruv, Footer)
├── HomePage (SearchBox, TypeCards, SemanticChips, AlphabetIndex)
├── EntryPage (EntryHeader, DefinitionBlock, ExampleBlock,
│              SourceCard, CommentaryBlock, RelationList → Tooltip)
├── CatalogPage (FilterPanel, EntryList, EntryCard)
└── AboutPage
```

---

## 5. Qidiruv mexanizmi (server tomonda, Python)

1. Import vaqtida barcha matn **normallashtiriladi** va bazada alohida ustunlarda
   saqlanadi: `oʻ/o‘/o' → o'`, `gʻ/g‘/g' → g'`, kichik harf, ortiqcha probellar olib
   tashlanadi. Kirilcha yozilgan so'rovni lotinga o'girish ham shu qatlamga qo'shilishi
   mumkin (2-bosqichda).
2. So'rov kelganda u ham xuddi shu funksiya bilan normallashtiriladi — bitta manba,
   nomuvofiqlik bo'lmaydi.
3. **rapidfuzz** bilan reyting: `unit` (og'irligi 3), `pronunciations` (2), `synonyms` (2),
   `hypernym` (1), `contextText` (0.5). Avval aniq/prefiks moslik, keyin fuzzy.
4. Natijada foydalanuvchi `Navoi`, `navoiy`, `NAVOIY` deb yozsa ham bitta natijaga keladi.
5. Hech narsa topilmasa — API eng yaqin 5 ta taklifni qaytaradi
   ("Balki bularni izlagandirsiz").
6. Autocomplete uchun ham shu endpoint ishlatiladi (`?limit=7`), javob tez —
   butun baza xotirada keshlash mumkin (~103 yozuv).

---

## 6. Audio (talaffuz) — qaror talab qilinadi

Skrinshotda 🔊 tugma bor. Variantlar:
- **A. Keyinga qoldirish** (tavsiya, 1-bosqichda): tugma UI'da turadi, "tez orada" holatida.
- **B. TTS xizmati**: o'zbek tilini qo'llovchi TTS (masalan, Narakeet/Azure `uz-UZ`) bilan
  audio fayllarni **oldindan generatsiya qilib** statik saqlash — server kerak bo'lmaydi.
- **C. Jonli yozuv**: diktor yozib beradi — eng sifatli, lekin mehnat talab.

## 7. Ish bosqichlari (roadmap)

| Bosqich | Ish | Natija |
|---|---|---|
| 1 | Import skripti: Excel → SQLite (tozalash + normalizatsiya) | Toza ma'lumot bazada |
| 2 | FastAPI: modellar, `/api/entries`, `/api/search`, `/api/filters` | Ishlaydigan API (Swagger'da tekshiriladi) |
| 3 | Vite + React skelet, routing, dizayn-sistema tokenlari | Ishga tushadigan karkas |
| 4 | Birlik sahifasi (lug'at ko'rinishi, uzellar tizimi asosida) | Asosiy UX tayyor |
| 5 | Qidiruv + bosh sahifa (autocomplete bilan) | Foydalanish mumkin |
| 6 | Katalog, filtrlar, tooltip'lar, uzellar ko'rinishi, chop etish | To'liq funksional |
| 7 | Sayqal: responsive, audio, deploy | Nashr |

---

## 8. Ochiq savollar (ishni boshlashdan oldin)

1. **Dizayn-sistema** — siz berasiz (ranglar, shrift, komponentlar). Shu kutilmoqda.
2. **Audio** — yuqoridagi A/B/C variantlardan qaysi biri?
3. **Iqtibos faylidagi 21 ta chala yozuv** — ular ham saytda ko'rinsinmi (mavjud qismi
   bilan) yoki to'ldirilguncha yashirilsinmi? Tavsiya: ko'rsatish, bo'sh bloklar
   avtomatik berkitiladi.
4. Kelajakda **boshqa mualliflar asarlari** ham qo'shiladimi? (Sxema bunga tayyor —
   `intertext.author` maydoni bor.)
