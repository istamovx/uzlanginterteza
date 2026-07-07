# Dizayn-sistema: Align UI 2.0

Manba: [Align UI ✦ Design System 2.0 (Figma)](https://www.figma.com/design/jRrDR2MzYN7lustqAlOyMi/)
Figma MCP orqali fayldan olingan tokenlar quyida. Ushbu nusxada faqat **Cover** va
**Brand** sahifalari mavjud — to'liq palitra (primary, state ranglari) uchun AlignUI
rasmiy Tailwind preseti ishlatiladi (dizayn-sistema kod tomonda ham shu nom bilan
tarqatiladi, tokenlar birxil).

## 1. Tipografika

Ikkala shrift Google Fonts'da bor:
- **Inter Display** — sarlavhalar (Title)
- **Inter** — qolgan hamma narsa (Label, Paragraph, Subheading)

| Token | Shrift | O'lcham / qator | Vazn | Ishlatilishi bizda |
|---|---|---|---|---|
| Title/H1 | Inter Display | 56 / 64 | 500 | Bosh sahifa sarlavhasi |
| Title/H4 | Inter Display | 32 / 40 | 500 | Birlik sahifasi sarlavhasi (so'z nomi) |
| Title/H5 | Inter Display | 24 / 32 | 500 | Bo'lim sarlavhalari |
| Label/X Large | Inter | 24 / 32 | 500 | — |
| Label/Medium | Inter | 16 / 24 | 500 | Tugmalar, blok yorliqlari ("Izoh:", "Namuna:") |
| Label/Small | Inter | 14 / 20 | 500 | Filtrlar, chip'lar |
| Label/X Small | Inter | 12 / 16 | 500 | Badge'lar (yadro/periferiya, tur) |
| Paragraph/Large | Inter | 18 / 24 | 400 | Intertekstual matn (namuna) |
| Paragraph/Medium | Inter | 16 / 24 | 400 | Asosiy matn (izoh, sharh) |
| Paragraph/Small | Inter | 14 / 20 | 400 | Manba ma'lumotlari, tooltip matni |
| Subheading/Small | Inter | 14 / 20, letter-spacing 6% | 500 | UPPERCASE bo'lim yorliqlari |
| Docs/Paragraph | Inter | 18 / 32 | 400 | "Loyiha haqida" sahifasi matni |

## 2. Rang tokenlari (Figma'dan olingan)

Semantik nomlash — komponentlar to'g'ridan-to'g'ri hex emas, token ishlatadi:

```css
:root {
  /* text */
  --text-strong-950:   #171717;  /* asosiy matn, sarlavhalar */
  --text-sub-600:      #5c5c5c;  /* ikkilamchi matn (manba, meta) */
  --text-soft-400:     #a3a3a3;  /* uchlamchi / placeholder */
  --text-disabled-300: #d1d1d1;

  /* background */
  --bg-white-0:    #ffffff;  /* sahifa foni, kartalar */
  --bg-weak-50:    #f7f7f7;  /* bloklar foni, hover */
  --bg-soft-200:   #ebebeb;  /* ajratkichlar foni */
  --bg-surface-800:#262626;  /* qorong'i sirt (tooltip, footer) */

  /* stroke */
  --stroke-soft-200: #ebebeb; /* karta va ajratkich chiziqlari */

  /* icon */
  --icon-sub-600:  #5c5c5c;
  --icon-soft-400: #a3a3a3;

  /* static */
  --static-black: #171717;
  --static-white: #ffffff;

  /* state (Brand sahifasidan namuna) */
  --state-highlighted-light: #ffc0df;
  --state-highlighted-dark:  #68123d;

  /* radius */
  --radius-16:   16px;   /* kartalar */
  --radius-full: 999px;  /* badge, chip, tugma */
}
```

**To'liq palitra** (primary/blue, error/red, success/green, warning/orange,
information, feature/purple va boshqa state ranglari hamda to'liq neutral shkala)
AlignUI rasmiy Tailwind presetidan olinadi — Figma nusxada bu sahifalar yo'q.
Agar Figma faylning to'liq versiyasidagi Foundations/Colors sahifa havolasi
(node-id bilan) berilsa, tokenlarni bevosita fayldan sinxronlashtiramiz.

## 3. Bizning ilovaga xoslash (semantik rollar)

| Rol | Token |
|---|---|
| Birlik nomi (sarlavha) | Title/H4 + `--text-strong-950` |
| Blok yorlig'i ("Izoh:", "Namuna:") | Label/Medium, aksent rang (primary yoki state) |
| Namuna matni | Paragraph/Large, kursiv, `--text-sub-600` |
| Manba qatori | Paragraph/Small + `--text-soft-400` |
| Havolalar (sinonim, giponim...) | Label/Small + primary rang, hover'da underline |
| Badge: `yadro` | Label/X Small, to'q fon (`--state-highlighted-dark` uslubida) |
| Badge: `periferiya` | Label/X Small, och fon (`--state-highlighted-light` uslubida) |
| Karta (asl manba, tooltip) | `--bg-white-0` + `--stroke-soft-200` + `--radius-16` |
| Hover-tooltip | oq karta, soya, `--radius-16` |
| Uzellar diagrammasi | `--bg-weak-50` uzellar, `--stroke-soft-200` chiziqlar |

## 4. Kodda joriy qilish

- **Tailwind CSS v4** + AlignUI token preseti: barcha tokenlar CSS variable sifatida
  `@theme` orqali e'lon qilinadi, komponentlar `text-strong-950`, `bg-weak-50` kabi
  klasslar bilan ishlaydi.
- AlignUI'ning tayyor React komponentlari (Button, Badge, Input, Tooltip, Modal)
  copy-paste modelida olinadi (shadcn uslubi) — kerakligina, butun kutubxona emas.
- Shriftlar: `Inter` va `Inter Display` — Google Fonts'dan `@font-face` bilan
  (yoki Fontsource npm paketi orqali, offline ishlashi uchun).
