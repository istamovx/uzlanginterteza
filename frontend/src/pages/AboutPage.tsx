import { useEffect, useState } from "react";
import { api } from "../api";
import StarOrnament from "../components/StarOrnament";

/* Korpus asarlari. Muqova bo'lmasa — tipografik o'rinbosar ko'rsatiladi. */
const BOOKS: { title: string; cover?: string; tint: string }[] = [
  { title: "Isyon va itoat", cover: "/covers/isyon-va-itoat.webp", tint: "#68123d" },
  { title: "Seni kutdim", tint: "#7d52f4" },
  { title: "To‘lin oy qissasi", cover: "/covers/tolin-oy-qissasi.webp", tint: "#1f3bad" },
  { title: "Eski dunyo va yangi men", cover: "/covers/eski-dunyo-va-yangi-men.webp", tint: "#262626" },
  { title: "Ota", cover: "/covers/ota.webp", tint: "#262626" },
  { title: "To‘rt ko‘cha", cover: "/covers/tort-kocha.webp", tint: "#ff8447" },
  { title: "Muvozanat", tint: "#335cff" },
  { title: "Sabo va Samandar", cover: "/covers/sabo-va-samandar.webp", tint: "#fb4ba3" },
];

/* Apostrof variantlari va registrni birxillashtirish (backend normalize bilan bir xil) */
const norm = (s: string) =>
  s.replace(/[ʻ‘’`´ʼ′']/g, "'").replace(/\s+/g, " ").trim().toLowerCase();

const NODES = [
  { name: "Intertekstual birlik", desc: "Allyuziv nom, iqtibos yoki maqol, talaffuz variantlari", color: "#335cff" },
  { name: "Intertekstual matn", desc: "Birlik uchragan asar: muallif, janr, davr, sahifa", color: "#7d52f4" },
  { name: "Asl manba", desc: "Kelib chiqishi: muallif, asar, janr, davr", color: "#1fc16b" },
  { name: "Tanilish darajasi", desc: "Yadro yoki periferiya", color: "#fb4ba3" },
  { name: "Kontekstual sharh", desc: "Matndagi vazifasi va ma'no qirralari", color: "#ff8447" },
  { name: "Semantik maydon", desc: "Badiiy, tarixiy, diniy, ijtimoiy-falsafiy...", color: "#47c2ff" },
  { name: "Semantik munosabat", desc: "Kontekstual sinonim, giperonim, giponim", color: "#fb3748" },
  { name: "Izoh", desc: "Kengaytirilgan lingvistik tahlil", color: "#2547d0" },
];

export default function AboutPage() {
  // Asar nomi Excel'da "Eski dunyo va yangi men. Saylanma. ..." kabi kengaytirilgan
  // shakllarda ham keladi — shuning uchun boshlanishi bo'yicha jamlanadi.
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    api
      .filters()
      .then((f) => {
        const result: Record<string, number> = {};
        for (const b of BOOKS) {
          const key = norm(b.title);
          result[b.title] = f.works
            .filter((w) => norm(w.value).startsWith(key))
            .reduce((sum, w) => sum + w.count, 0);
        }
        setCounts(result);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="anim-fade-up flex w-full flex-col gap-8 py-4">
      <h1 className="font-display text-[clamp(24px,4vw,32px)] font-semibold">
        Loyiha haqida
      </h1>
      <div className="flex flex-col gap-4 text-lg leading-8">
        <p>
          <b>O‘ZBEK INTERTEKSTUAL TEZAURUSI</b> — o'zbek badiiy matnlaridagi
          intertekstual birliklarni (allyuziv nomlar, iqtiboslar va maqollarni) tizimli
          tavsiflovchi elektron lug'at. Korpus sifatida Ulug'bek Hamdamning
          «Isyon va itoat», «Seni kutdim», «To‘lin oy qissasi», «Eski dunyo va
          yangi men», «Ota», «To‘rt ko‘cha», «Muvozanat» va «Sabo va Samandar»
          asarlari tanlangan.
        </p>
        <p>
          Qidiruv imlo variantlariga chidamli: apostrofning turli shakllari
          (oʻ, o', o') va talaffuz variantlari (Navoiy / Navoyi / Navoi)
          avtomatik hisobga olinadi.
        </p>
        <p>
          Loyiha muallifi — <b>O'rinova Zarifa</b>.
        </p>
      </div>

      {/* Korpus asarlari */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <StarOrnament className="h-5 w-5 text-primary/60" />
          <h2 className="font-display text-xl font-semibold">Korpus asarlari</h2>
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 xl:grid-cols-8">
          {BOOKS.map((b) => (
            <li key={b.title} className="flex flex-col gap-2">
              <div className="aspect-[2/3] overflow-hidden rounded-lg border border-soft-200 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                {b.cover ? (
                  <img
                    src={b.cover}
                    alt={`«${b.title}» kitobi muqovasi`}
                    width={600}
                    height={900}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full w-full flex-col justify-between p-4 text-white-0"
                    style={{ background: `linear-gradient(160deg, ${b.tint}, #171717)` }}
                  >
                    <span className="text-xs uppercase tracking-widest opacity-80">
                      Ulug‘bek Hamdam
                    </span>
                    <span className="font-display text-xl font-semibold leading-tight">
                      {b.title}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-medium leading-snug">{b.title}</span>
                {counts[b.title] > 0 && (
                  <span className="text-sub">{counts[b.title]} ta birlik</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Uzellar tizimi */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <StarOrnament className="h-5 w-5 text-primary/60" />
          <h2 className="font-display text-xl font-semibold">
            Uzellar tizimi — tavsif modeli
          </h2>
        </div>
        <p className="text-sub">
          Har bir birlik sakkiz uzeldan iborat ilmiy model asosida tahlil
          qilinadi:
        </p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {NODES.map((n) => (
            <div
              key={n.name}
              className="flex flex-col gap-1 rounded-2xl border border-soft-200 p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ background: n.color }}
                  aria-hidden
                />
                <h3 className="font-display font-semibold">{n.name}</h3>
              </div>
              <p className="pl-[22px] text-sub">{n.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
