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
      <div className="relative grid w-full gap-8 py-10 sm:grid-cols-3 px-4 sm:px-6 lg:px-10 2xl:px-16">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 font-display font-semibold">
            <StarOrnament className="h-4 w-4 text-primary" />
            <span>
              O‘ZBEK INTERTEKSTUAL <span className="text-primary">TEZAURUSI</span>
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
        <div className="flex w-full items-center justify-between gap-4 py-4 text-sub px-4 sm:px-6 lg:px-10 2xl:px-16">
          <p>
            © {new Date().getFullYear()} O‘ZBEK INTERTEKSTUAL TEZAURUSI ·
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
