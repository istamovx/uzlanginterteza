"""Baza ulanishi: DATABASE_URL berilsa PostgreSQL (Render), aks holda SQLite (lokal).

Ikkala holatda ham bitta `entries` jadvali va bir xil SQL ishlatiladi —
farq faqat parametr belgisida (? / %s) va ulanish usulida.

PostgreSQL bo'sh bo'lsa (birinchi deploy), u repodagi SQLite fayldan
(backend/data/tezaurus.db) avtomatik to'ldiriladi.
"""

import os
import sqlite3
from pathlib import Path

SQLITE_PATH = Path(__file__).resolve().parents[1] / "data" / "tezaurus.db"
DATABASE_URL = os.environ.get("DATABASE_URL", "")
IS_POSTGRES = DATABASE_URL.startswith(("postgres://", "postgresql://"))

# SQL parametr belgisi: sqlite3 — "?", psycopg — "%s"
PH = "%s" if IS_POSTGRES else "?"

SCHEMA = """
CREATE TABLE IF NOT EXISTS entries (
    id                  TEXT PRIMARY KEY,
    type                TEXT NOT NULL,          -- 'allyuziv-nom' | 'iqtibos' | 'maqol'
    unit                TEXT NOT NULL,
    unit_normalized     TEXT NOT NULL,
    pronunciations      TEXT NOT NULL,          -- JSON massiv
    context_text        TEXT NOT NULL,
    intertext_author    TEXT NOT NULL,
    intertext_work      TEXT NOT NULL,
    intertext_genre     TEXT NOT NULL,
    intertext_year      TEXT NOT NULL,
    intertext_publisher TEXT NOT NULL,
    intertext_page      TEXT NOT NULL,
    source_description  TEXT NOT NULL,
    source_author       TEXT NOT NULL,
    source_work         TEXT NOT NULL,
    source_genre        TEXT NOT NULL,
    source_publisher    TEXT NOT NULL,
    source_period       TEXT NOT NULL,
    recognition         TEXT NOT NULL,          -- 'yadro' | 'periferiya' | ''
    commentary          TEXT NOT NULL,
    semantic_field      TEXT NOT NULL,
    synonyms            TEXT NOT NULL,          -- JSON massiv
    hypernym            TEXT NOT NULL,
    hyponym             TEXT NOT NULL,
    note                TEXT NOT NULL,
    is_complete         INTEGER NOT NULL        -- asl manba/sharh to'ldirilganmi
)
"""


def connect():
    """Yangi ulanish. Qatorlar ikkala bazada ham row["ustun"] ko'rinishida o'qiladi."""
    if IS_POSTGRES:
        import psycopg
        from psycopg.rows import dict_row

        return psycopg.connect(DATABASE_URL, row_factory=dict_row)
    SQLITE_PATH.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(SQLITE_PATH)
    con.row_factory = sqlite3.Row
    return con


def insert_entries(con, entries: list[dict]) -> None:
    if not entries:
        return
    cols = list(entries[0].keys())
    con.cursor().executemany(
        f"INSERT INTO entries ({','.join(cols)}) VALUES ({','.join([PH] * len(cols))})",
        [tuple(e[c] for c in cols) for e in entries],
    )


def fetch_all(con) -> list:
    return con.execute("SELECT * FROM entries").fetchall()


def ensure_ready() -> None:
    """Jadvalni yaratish; PostgreSQL bo'sh bo'lsa — repodagi SQLite'dan to'ldirish."""
    if not IS_POSTGRES:
        if not SQLITE_PATH.exists():
            raise RuntimeError(
                f"Baza topilmadi: {SQLITE_PATH}. Avval `python scripts/import_excel.py` ishga tushiring."
            )
        return
    con = connect()
    try:
        con.execute(SCHEMA)
        count = con.execute("SELECT COUNT(*) AS n FROM entries").fetchone()["n"]
        if count == 0 and SQLITE_PATH.exists():
            src = sqlite3.connect(SQLITE_PATH)
            src.row_factory = sqlite3.Row
            rows = [dict(r) for r in src.execute("SELECT * FROM entries").fetchall()]
            src.close()
            insert_entries(con, rows)
            print(f"PostgreSQL bo'sh edi — {len(rows)} ta yozuv SQLite'dan ko'chirildi")
        con.commit()
    finally:
        con.close()
