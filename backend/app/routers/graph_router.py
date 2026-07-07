"""Umumiy semantik tarmoq va matn tahlili endpointlari."""

import re
from collections import Counter

from fastapi import APIRouter
from pydantic import BaseModel, Field

from .. import db
from ..normalize import normalize

router = APIRouter()

_APOSTROPHES = "ʻ‘’`´ʼ′'"
_CHAR_NORM = str.maketrans({c: "'" for c in _APOSTROPHES})


def _char_normalize(text: str) -> str:
    """Uzunlikni o'zgartirmaydigan normalizatsiya (pozitsiyalar saqlanadi):
    apostrof variantlari → ', kichik harf. Probellar siqilmaydi."""
    return text.translate(_CHAR_NORM).lower()


def _is_word_char(ch: str) -> bool:
    return ch.isalnum() or ch == "'"


@router.get("/graph")
def get_graph():
    """Butun tezaurus grafi: birlik tugunlari + giperonim guruh tugunlari,
    giperonim va sinonim bog'lari."""
    entries = db.all_entries()
    by_unit = {e["_norm"]["unit"]: e["id"] for e in entries}

    nodes = [
        {
            "id": e["id"],
            "label": e["unit"],
            "kind": "entry",
            "type": e["type"],
            "recognition": e["recognition"],
        }
        for e in entries
    ]

    # Giperonim guruhlari (apostrof variantlari birlashtiriladi)
    hyp_display: dict[str, Counter] = {}
    for e in entries:
        if e["hypernym"]:
            hyp_display.setdefault(normalize(e["hypernym"]), Counter())[e["hypernym"]] += 1

    edges: list[dict] = []
    seen_pairs: set[tuple[str, str]] = set()

    for key, counter in hyp_display.items():
        nodes.append({
            "id": f"h:{key}",
            "label": counter.most_common(1)[0][0],
            "kind": "hypernym",
            "count": sum(counter.values()),
        })

    for e in entries:
        if e["hypernym"]:
            edges.append({
                "source": e["id"],
                "target": f"h:{normalize(e['hypernym'])}",
                "kind": "hypernym",
            })
        for s in e["synonyms"]:
            target = by_unit.get(normalize(s))
            if target and target != e["id"]:
                pair = tuple(sorted((e["id"], target)))
                if pair not in seen_pairs:
                    seen_pairs.add(pair)
                    edges.append({"source": pair[0], "target": pair[1], "kind": "synonym"})

    return {"nodes": nodes, "edges": edges}


class AnalyzeIn(BaseModel):
    text: str = Field(..., max_length=30_000)


@router.post("/analyze")
def analyze(payload: AnalyzeIn):
    """Berilgan matndan bazadagi intertekstual birliklarni topish.

    Moslash birlik nomi va talaffuz variantlari bo'yicha, apostrof/registr
    farqlariga chidamli. Javob: asl matndagi pozitsiyalar (start/end).
    """
    text = payload.text
    norm = _char_normalize(text)
    n = len(norm)

    # Variant → entry ro'yxati (uzunroq variantlar birinchi tekshiriladi)
    variants: list[tuple[str, dict]] = []
    for e in db.all_entries():
        vs = {e["_norm"]["unit"]}
        vs.update(normalize(p) for p in e["pronunciations"])
        for v in vs:
            # juda qisqa variantlar shovqin beradi
            if len(v) >= 3 and " " not in v or len(v) >= 5:
                variants.append((v, e))

    raw: list[dict] = []
    for v, e in variants:
        # probellarni moslashuvchan qilish uchun regex (bir nechta probel ham mos)
        pattern = re.escape(v).replace(r"\ ", r"\s+")
        for m in re.finditer(pattern, norm):
            start, end = m.start(), m.end()
            if start > 0 and _is_word_char(norm[start - 1]):
                continue
            if end < n and _is_word_char(norm[end]):
                continue
            raw.append({
                "start": start,
                "end": end,
                "entryId": e["id"],
                "unit": e["unit"],
                "type": e["type"],
            })

    # Ustma-ust tushganlarda uzunrog'i qoladi
    raw.sort(key=lambda m: (m["start"], -(m["end"] - m["start"])))
    matches: list[dict] = []
    last_end = -1
    for m in raw:
        if m["start"] >= last_end:
            matches.append(m)
            last_end = m["end"]

    found = Counter(m["entryId"] for m in matches)
    by_id = {m["entryId"]: m for m in matches}
    summary = [
        {"entryId": eid, "unit": by_id[eid]["unit"], "type": by_id[eid]["type"], "count": c}
        for eid, c in found.most_common()
    ]
    return {"matches": matches, "found": summary}
