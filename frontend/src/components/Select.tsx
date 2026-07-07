import { useEffect, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
  count?: number;
}

/* Align UI uslubidagi maxsus dropdown: native <select> o'rniga.
   Klaviatura: ↑/↓ — harakat, Enter/Space — tanlash, Esc — yopish. */
export default function Select({
  label,
  value,
  options,
  onChange,
  allLabel = "Barchasi",
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  allLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const all: SelectOption[] = [{ value: "", label: allLabel }, ...options];
  const selectedIndex = Math.max(
    all.findIndex((o) => o.value === value),
    0
  );
  const selected = all[selectedIndex];

  // Tashqariga bosilganda yopish
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Ochilganda tanlangan qatordan boshlash
  useEffect(() => {
    if (open) setActive(selectedIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Faol qator ko'rinib turishi uchun
  useEffect(() => {
    if (!open) return;
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const choose = (i: number) => {
    onChange(all[i].value);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "Escape":
        setOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => Math.min(a + 1, all.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(all.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(active);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className="relative" onKeyDown={onKeyDown}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-white-0 px-3.5 py-2.5 text-left outline-none transition-colors ${
          open
            ? "border-primary shadow-[0_0_0_3px_var(--color-primary-light)]"
            : "border-soft-200 hover:border-disabled focus-visible:border-primary"
        }`}
      >
        <span className="flex min-w-0 items-baseline gap-1.5">
          <span className="shrink-0 text-sub">{label}:</span>
          <span
            className={`truncate font-medium ${
              value ? "text-primary" : "text-strong"
            }`}
          >
            {selected.label}
          </span>
        </span>
        <svg
          className={`h-4 w-4 shrink-0 text-soft transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label={label}
          className="absolute left-0 top-full z-30 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-soft-200 bg-white-0 p-1.5 shadow-lg sm:w-max sm:min-w-full sm:max-w-[min(90vw,380px)]"
        >
          {all.map((o, i) => (
            <li
              key={o.value || "__all"}
              role="option"
              aria-selected={i === selectedIndex}
              onClick={() => choose(i)}
              onPointerEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-[10px] px-3 py-2 ${
                i === active ? "bg-weak-50" : ""
              } ${i === selectedIndex ? "font-medium text-primary" : "text-strong"}`}
            >
              <span className="min-w-0 flex-1">{o.label}</span>
              {o.count !== undefined && (
                <span className="shrink-0 text-soft">{o.count}</span>
              )}
              {i === selectedIndex && (
                <svg
                  className="h-4 w-4 shrink-0 text-primary"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
