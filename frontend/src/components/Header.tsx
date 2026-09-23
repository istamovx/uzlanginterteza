import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import StarOrnament from "./StarOrnament";

const links = [
  { to: "/", label: "Bosh sahifa" },
  { to: "/katalog", label: "Katalog" },
  { to: "/tarmoq", label: "Tarmoq" },
  { to: "/tahlil", label: "Tahlil" },
  { to: "/statistika", label: "Statistika" },
  { to: "/haqida", label: "Haqida" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Sahifa almashganda mobil menyu yopiladi
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative rounded-full px-3 py-1.5 font-medium transition-colors after:absolute after:inset-x-3 after:bottom-0.5 after:h-[2px] after:origin-left after:rounded-full after:bg-gradient-to-r after:from-primary after:to-feature after:transition-transform after:duration-300 ${
      isActive
        ? "bg-primary-light/60 text-primary-darker after:scale-x-100"
        : "text-sub after:scale-x-0 hover:bg-white-0/70 hover:text-strong hover:after:scale-x-100"
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-soft-200 bg-white-0/90 backdrop-blur">
      {/* Fon: yumshoq gradient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-light/70 via-transparent to-feature-light/60" />
      </div>

      <div className="relative flex w-full items-center justify-between gap-4 py-3 px-4 sm:px-6 lg:px-10 2xl:px-16">
        <Link
          to="/"
          className="flex min-w-0 items-center gap-2 font-display text-lg font-semibold tracking-tight"
        >
          <StarOrnament className="anim-spin-slow h-5 w-5 shrink-0 text-primary" />
          <span className="truncate">
            O‘ZBEK INTERTEKSTUAL{" "}
            <span className="anim-gradient-text">TEZAURUSI</span>
          </span>
        </Link>

        {/* Desktop menyu */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobil menyu tugmasi */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-soft-200 bg-white-0/70 text-sub transition-colors hover:border-primary hover:text-primary md:hidden"
          aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
          aria-expanded={open}
        >
          {open ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobil menyu paneli */}
      {open && (
        <nav className="relative border-t border-soft-200 bg-white-0/95 px-4 py-3 backdrop-blur md:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === "/"}
                  className={({ isActive }) =>
                    `block rounded-xl px-4 py-2.5 font-medium transition-colors ${
                      isActive
                        ? "bg-primary-light/60 text-primary-darker"
                        : "text-sub hover:bg-weak-50 hover:text-strong"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
