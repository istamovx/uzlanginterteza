import { useState } from "react";
import { Link } from "react-router-dom";
import { api, type EntryDetail } from "../api";

const cache = new Map<string, EntryDetail>();

/** Skrinshotlardagi kabi: bog'langan birlik ustiga borilganda mini-karta chiqadi. */
export default function TooltipLink({
  entryId,
  text,
}: {
  entryId: string | null;
  text: string;
}) {
  const [detail, setDetail] = useState<EntryDetail | null>(null);
  const [show, setShow] = useState(false);

  if (!entryId) {
    return <span className="text-sub">{text}</span>;
  }

  const load = () => {
    setShow(true);
    if (cache.has(entryId)) {
      setDetail(cache.get(entryId)!);
      return;
    }
    api.entry(entryId).then((d) => {
      cache.set(entryId, d);
      setDetail(d);
    });
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={load}
      onMouseLeave={() => setShow(false)}
    >
      <Link
        to={`/birlik/${entryId}`}
        className="font-medium text-primary underline-offset-2 hover:underline"
      >
        {text}
      </Link>
      {show && detail && (
        <span className="absolute left-0 top-full z-30 mt-1 hidden w-80 max-w-[80vw] flex-col gap-2 rounded-2xl border border-soft-200 bg-white-0 p-4 shadow-lg sm:flex">
          <span className="border-b border-soft-200 pb-2 font-semibold">
            {detail.unit}
          </span>
          {detail.contextText && (
            <span className="line-clamp-3">
              <b className="text-primary">Namuna:</b>{" "}
              <i className="text-sub">{detail.contextText}</i>
            </span>
          )}
          {(detail.originalSource.description || detail.note) && (
            <span className="line-clamp-3">
              <b className="text-error">Izoh:</b>{" "}
              {detail.originalSource.description || detail.note}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
