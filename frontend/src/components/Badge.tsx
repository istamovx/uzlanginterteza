import type { ReactNode } from "react";

type Variant =
  | "type-allyuziv"
  | "type-iqtibos"
  | "yadro"
  | "periferiya"
  | "field"
  | "neutral";

const styles: Record<Variant, string> = {
  "type-allyuziv": "bg-primary-light text-primary-darker",
  "type-iqtibos": "bg-feature-light text-feature",
  yadro: "bg-highlight-dark text-white-0",
  periferiya: "bg-highlight-light text-highlight-dark",
  field: "bg-weak-50 text-sub border border-soft-200",
  neutral: "bg-weak-50 text-sub",
};

export default function Badge({
  variant,
  children,
}: {
  variant: Variant;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-0.5 font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
