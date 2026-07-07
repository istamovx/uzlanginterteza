import { Link } from "react-router-dom";
import StarOrnament from "./StarOrnament";

const pages = [
  { to: "/", label: "Bosh sahifa" },
  { to: "/katalog", label: "Katalog" },
  { to: "/tarmoq", label: "Semantik tarmoq" },
  { to: "/tahlil", label: "Matn tahlili" },
  { to: "/statistika", label: "Statistika" },
  { to: "/haqida", label: "Loyiha haqida" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-soft-200 bg-weak-50">
      <div className="relative mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 font-display font-semibold">
            <StarOrnament className="h-4 w-4 text-primary" />
            <span>
              O'zbek intertekstual <span className="text-primary">tezaurusi</span>
            </span>
          </div>
          <p className="text-sub">
            Muallif: <b className="text-strong">O'rinova Zarifa</b>
          </p>
        </div>

        <nav className="flex flex-col gap-2" aria-label="Sahifalar">
          <h3 className="font-display font-semibold">Sahifalar</h3>
          {pages.map((p) => (
            <Link
              key={p.to}
              to={p.to}
              className="w-fit text-sub transition-colors hover:text-primary"
            >
              {p.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-2">
          <h3 className="font-display font-semibold">Metodologiya</h3>
          <p className="text-sub">
            Har bir birlik <b>uzellar tizimi</b> asosida tavsiflanadi:
            intertekstual matn, asl manba, tanilish darajasi, semantik maydon
            va munosabatlar.
          </p>
        </div>
      </div>
      <div className="relative border-t border-soft-200">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-4 text-sub sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} O'zbek intertekstual tezaurusi ·
            O'rinova Zarifa
          </p>
          <Link to="/admin" className="transition-colors hover:text-primary">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
