import StarOrnament from "../components/StarOrnament";

const NODES = [
  { name: "Intertekstual birlik", desc: "Allyuziv nom yoki iqtibos, talaffuz variantlari", color: "#335cff" },
  { name: "Intertekstual matn", desc: "Birlik uchragan asar: muallif, janr, davr, sahifa", color: "#7d52f4" },
  { name: "Asl manba", desc: "Kelib chiqishi: muallif, asar, janr, davr", color: "#1fc16b" },
  { name: "Tanilish darajasi", desc: "Yadro yoki periferiya", color: "#fb4ba3" },
  { name: "Kontekstual sharh", desc: "Matndagi vazifasi va ma'no qirralari", color: "#ff8447" },
  { name: "Semantik maydon", desc: "Badiiy, tarixiy, diniy, ijtimoiy-falsafiy...", color: "#47c2ff" },
  { name: "Semantik munosabat", desc: "Kontekstual sinonim, giperonim, giponim", color: "#fb3748" },
  { name: "Izoh", desc: "Kengaytirilgan lingvistik tahlil", color: "#2547d0" },
];

export default function AboutPage() {
  return (
    <div className="anim-fade-up mx-auto flex w-full max-w-2xl flex-col gap-8 py-4">
      <h1 className="font-display text-[clamp(24px,4vw,32px)] font-semibold">
        Loyiha haqida
      </h1>
      <div className="flex flex-col gap-4 text-lg leading-8">
        <p>
          <b>O'zbek intertekstual tezaurusi</b> — o'zbek badiiy matnlaridagi
          intertekstual birliklarni (allyuziv nomlar va iqtiboslarni) tizimli
          tavsiflovchi elektron lug'at. Korpus sifatida Ulug'bek Hamdamning
          «Ota», «To'rt ko'cha», «Muvozanat», «Sabo va Samandar» kabi asarlari
          tanlangan.
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
        <div className="grid gap-3 sm:grid-cols-2">
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
