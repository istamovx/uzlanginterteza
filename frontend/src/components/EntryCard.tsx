import { Link } from "react-router-dom";
import { TYPE_LABELS, type EntrySummary } from "../api";
import Badge from "./Badge";

export default function EntryCard({ entry }: { entry: EntrySummary }) {
  return (
    <Link
      to={`/birlik/${entry.id}`}
      className="group flex flex-col gap-2 rounded-2xl border border-soft-200 bg-white-0 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
          {entry.unit}
        </h3>
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-weak-50 text-soft opacity-0 transition-all duration-300 group-hover:bg-primary-light group-hover:text-primary group-hover:opacity-100"
          aria-hidden
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
          </svg>
        </span>
      </div>
      {entry.contextText && (
        <p className="line-clamp-2 italic text-sub">«{entry.contextText}»</p>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <Badge
          variant={entry.type === "iqtibos" ? "type-iqtibos" : "type-allyuziv"}
        >
          {TYPE_LABELS[entry.type]}
        </Badge>
        {entry.recognition && (
          <Badge variant={entry.recognition === "yadro" ? "yadro" : "periferiya"}>
            {entry.recognition}
          </Badge>
        )}
        {entry.work && <span className="text-sub">«{entry.work}»</span>}
      </div>
    </Link>
  );
}
