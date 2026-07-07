"""Excel fayllarni tozalab SQLite bazaga import qilish.

Ishlatish:
    python scripts/import_excel.py [allyuziv.xlsx] [iqtibos.xlsx]

Argumentsiz chaqirilsa Desktop'dagi standart fayllarni oladi.
Baza har safar noldan quriladi (idempotent).

Parsing/tozalash mantig'i app/importer.py da — admin API bilan umumiy.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.importer import DB_PATH, read_rows_from_path, rebuild  # noqa: E402

DEFAULT_FILES = [
    (r"C:\Users\Xurshid\Desktop\ilova allyuziv nom (2).xlsx", "allyuziv-nom"),
    (r"C:\Users\Xurshid\Desktop\ilova Iqtibos (2).xlsx", "iqtibos"),
]


def main() -> None:
    files = DEFAULT_FILES
    if len(sys.argv) == 3:
        files = [(sys.argv[1], "allyuziv-nom"), (sys.argv[2], "iqtibos")]

    all_entries: list[dict] = []
    for path, type_ in files:
        rows = read_rows_from_path(path, type_)
        print(f"{path}: {len(rows)} ta yozuv")
        all_entries.extend(rows)

    rebuild(all_entries)
    complete = sum(e["is_complete"] for e in all_entries)
    print(f"Jami: {len(all_entries)} ta yozuv bazaga yozildi ({complete} ta to'liq), baza: {DB_PATH}")


if __name__ == "__main__":
    main()
