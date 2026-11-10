"""Umumiy semantik tarmoq va matn tahlili endpointlari."""

import re
from collections import Counter

from fastapi import APIRouter
from pydantic import BaseModel, Field

from .. import db
from ..normalize import char_normalize, normalize

router = APIRouter()


def _inside_word_before(text: str, start: int) -> bool:
    """start dan oldingi belgi so'z ichidami? Apostrof faqat harfdan keyin
    kelsa (oʻ, gʻ, ta'sir) so'z qismi; aks holda bu ochuvchi qo'shtirnoq (‘Adan’)."""
    if start == 0:
        return False
    prev = text[start - 1]
    if prev == "'":
        return start >= 2 and text[start - 2].isalnum()
    return prev.isalnum()


def _inside_word_after(text: str, end: int) -> bool:
    """end dagi belgi so'z davomimi? Apostrofdan keyin harf kelsa (bo'ri, g'oz)
    so'z davom etadi; aks holda bu yopuvchi qo'shtirnoq yoki oʻ/gʻ oxiri."""
    if end >= len(text):
        return False
    nxt = text[end]
    if nxt == "'":
        return end + 1 < len(text) and text[end + 1].isalnum()
    return nxt.isalnum()


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
    norm = char_normalize(text)

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
        # probellar moslashuvchan: bir nechta probel ham mos; tire atrofidagi
        # probel ixtiyoriy ("azobi ‒ go'r" = "azobi- go'r")
        pattern = re.escape(v).replace(r"\ ", r"\s+")
        pattern = re.sub(r"(?:\\s\+)?\\-(?:\\s\+)?", r"\\s*-\\s*", pattern)
        for m in re.finditer(pattern, norm):
            start, end = m.start(), m.end()
            if _inside_word_before(norm, start) or _inside_word_after(norm, end):
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
