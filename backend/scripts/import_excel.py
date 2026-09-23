"""Excel fayllarni tozalab SQLite bazaga import qilish.

Ishlatish:
    python scripts/import_excel.py [allyuziv.xlsx] [iqtibos.xlsx] [maqol.xlsx]

Argumentsiz chaqirilsa repodagi excel-manba/ papkasidagi standart fayllarni oladi.
Baza har safar noldan quriladi (idempotent).

Parsing/tozalash mantig'i app/importer.py da — admin API bilan umumiy.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.importer import DB_PATH, TYPE_PREFIX, read_rows_from_path, rebuild  # noqa: E402

SOURCE_DIR = Path(__file__).resolve().parents[2] / "excel-manba"
DEFAULT_FILES = [
    (SOURCE_DIR / "ilova allyuziv nom.xlsx", "allyuziv-nom"),
    (SOURCE_DIR / "ilova Iqtibos.xlsx", "iqtibos"),
    (SOURCE_DIR / "Maqol ilovam.xlsx", "maqol"),
]


def main() -> None:
    files = DEFAULT_FILES
    if len(sys.argv) > 1:
        files = list(zip(sys.argv[1:], TYPE_PREFIX))

    all_entries: list[dict] = []
    for path, type_ in files:
        rows = read_rows_from_path(str(path), type_)
        print(f"{path}: {len(rows)} ta yozuv")
        all_entries.extend(rows)

    rebuild(all_entries)
    complete = sum(e["is_complete"] for e in all_entries)
    print(f"Jami: {len(all_entries)} ta yozuv bazaga yozildi ({complete} ta to'liq), baza: {DB_PATH}")


if __name__ == "__main__":
    main()
