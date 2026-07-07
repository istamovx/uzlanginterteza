"""SQLite'dan yozuvlarni o'qish va xotirada keshlash.

Baza kichik (~100 yozuv), shuning uchun hammasi startupda bir marta o'qiladi.
API javob shakli (camelCase) shu yerda quriladi — routerlar bazaviy tuzilishni bilmaydi.
"""

import json
import sqlite3
from pathlib import Path

from .normalize import normalize

DB_PATH = Path(__file__).resolve().parents[1] / "data" / "tezaurus.db"

_entries: list[dict] = []
_by_id: dict[str, dict] = {}


def _row_to_entry(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "type": row["type"],
        "unit": row["unit"],
        "pronunciations": json.loads(row["pronunciations"]),
        "contextText": row["context_text"],
        "intertext": {
            "author": row["intertext_author"],
            "work": row["intertext_work"],
            "genre": row["intertext_genre"],
            "year": row["intertext_year"],
            "publisher": row["intertext_publisher"],
            "page": row["intertext_page"],
        },
        "originalSource": {
            "description": row["source_description"],
            "author": row["source_author"],
            "work": row["source_work"],
            "genre": row["source_genre"],
            "publisher": row["source_publisher"],
            "period": row["source_period"],
        },
        "recognition": row["recognition"],
        "commentary": row["commentary"],
        "semanticField": row["semantic_field"],
        "synonyms": json.loads(row["synonyms"]),
        "hypernym": row["hypernym"],
        "hyponym": row["hyponym"],
        "note": row["note"],
        "isComplete": bool(row["is_complete"]),
        # qidiruv uchun oldindan normallashtirilgan maydonlar (API javobiga kirmaydi)
        "_norm": {
            "unit": row["unit_normalized"],
            "pronunciations": [normalize(p) for p in json.loads(row["pronunciations"])],
            "synonyms": [normalize(s) for s in json.loads(row["synonyms"])],
            "hypernym": normalize(row["hypernym"]),
            "contextText": normalize(row["context_text"]),
        },
    }


def load() -> None:
    global _entries, _by_id
    if not DB_PATH.exists():
        raise RuntimeError(
            f"Baza topilmadi: {DB_PATH}. Avval `python scripts/import_excel.py` ishga tushiring."
        )
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    rows = con.execute("SELECT * FROM entries ORDER BY unit_normalized").fetchall()
    con.close()
    _entries = [_row_to_entry(r) for r in rows]
    _by_id = {e["id"]: e for e in _entries}


def all_entries() -> list[dict]:
    if not _entries:
        load()
    return _entries


def get(entry_id: str) -> dict | None:
    if not _by_id:
        load()
    return _by_id.get(entry_id)


def public(entry: dict) -> dict:
    """_norm siz nusxa — API javobi uchun."""
    return {k: v for k, v in entry.items() if not k.startswith("_")}


def summary(entry: dict) -> dict:
    """Ro'yxatlar uchun qisqa shakl."""
    ctx = entry["contextText"]
    return {
        "id": entry["id"],
        "type": entry["type"],
        "unit": entry["unit"],
        "semanticField": entry["semanticField"],
        "hypernym": entry["hypernym"],
        "recognition": entry["recognition"],
        "work": entry["intertext"]["work"],
        "contextText": ctx if len(ctx) <= 180 else ctx[:180].rsplit(" ", 1)[0] + "…",
        "isComplete": entry["isComplete"],
    }
