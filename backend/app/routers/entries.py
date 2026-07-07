import re
from collections import Counter

from fastapi import APIRouter, HTTPException, Query

from .. import db
from ..normalize import normalize

router = APIRouter()


def _first_letter(text: str) -> str:
    """Birinchi harf (tinish belgilari tashlab yuboriladi) — alifbo indeksi uchun."""
    for ch in text:
        if ch.isalpha():
            return ch.upper()
    return ""


def _matches(e: dict, type_: str | None, semantic_field: str | None,
             hypernym: str | None, recognition: str | None,
             work: str | None, letter: str | None) -> bool:
    if type_ and e["type"] != type_:
        return False
    if semantic_field and normalize(e["semanticField"]) != normalize(semantic_field):
        return False
    if hypernym and normalize(e["hypernym"]) != normalize(hypernym):
        return False
    if recognition and e["recognition"] != recognition:
        return False
    if work and normalize(e["intertext"]["work"]) != normalize(work):
        return False
    if letter and _first_letter(e["_norm"]["unit"]) != normalize(letter).upper():
        return False
    return True


@router.get("/entries")
def list_entries(
    type: str | None = None,
    semantic_field: str | None = None,
    hypernym: str | None = None,
    recognition: str | None = None,
    work: str | None = None,
    letter: str | None = None,
    offset: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    filtered = [
        e for e in db.all_entries()
        if _matches(e, type, semantic_field, hypernym, recognition, work, letter)
    ]
    return {
        "total": len(filtered),
        "items": [db.summary(e) for e in filtered[offset:offset + limit]],
    }


@router.get("/entries/{entry_id}")
def get_entry(entry_id: str):
    entry = db.get(entry_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Birlik topilmadi")

    result = db.public(entry)

    # sinonimlarni bazadagi birliklarga bog'lash (bo'lsa);
    # qavs ichidagi tavsif moslashtirishda hisobga olinmaydi:
    # "Zumrad (ertak qahramoni)" → "zumrad"
    by_unit = {e["_norm"]["unit"]: e["id"] for e in db.all_entries()}
    def syn_key(s: str) -> str:
        return normalize(re.sub(r"\([^)]*\)", " ", s))
    result["synonymsLinked"] = [
        {"text": s, "entryId": by_unit.get(syn_key(s))} for s in entry["synonyms"]
    ]

    # shu giperonim guruhidagi boshqa birliklar
    result["related"] = [
        db.summary(e) for e in db.all_entries()
        if e["id"] != entry_id and e["hypernym"]
        and normalize(e["hypernym"]) == normalize(entry["hypernym"])
    ][:6]

    return result


@router.get("/filters")
def get_filters():
    entries = db.all_entries()

    def count(getter) -> list[dict]:
        # Apostrof variantlari (oʻ/o'/o') bir guruhga birlashadi:
        # normallashtirilgan kalit bo'yicha guruhlab, eng ko'p uchragan
        # asl yozilish shakli ko'rsatiladi.
        groups: dict[str, Counter] = {}
        for e in entries:
            v = getter(e)
            if not v:
                continue
            groups.setdefault(normalize(v), Counter())[v] += 1
        items = [
            {"value": c.most_common(1)[0][0], "count": sum(c.values())}
            for c in groups.values()
        ]
        return sorted(items, key=lambda x: (-x["count"], x["value"]))

    letters = sorted({lt for e in entries if (lt := _first_letter(e["_norm"]["unit"]))})
    return {
        "types": count(lambda e: e["type"]),
        "semanticFields": count(lambda e: e["semanticField"]),
        "hypernyms": count(lambda e: e["hypernym"]),
        "recognitions": count(lambda e: e["recognition"]),
        "works": count(lambda e: e["intertext"]["work"]),
        "letters": letters,
    }


@router.get("/stats")
def get_stats():
    entries = db.all_entries()
    return {
        "total": len(entries),
        "byType": dict(Counter(e["type"] for e in entries)),
        "byRecognition": dict(Counter(e["recognition"] for e in entries if e["recognition"])),
        "complete": sum(e["isComplete"] for e in entries),
        "synonyms": sum(len(e["synonyms"]) for e in entries),
        "pronunciations": sum(len(e["pronunciations"]) for e in entries),
    }
