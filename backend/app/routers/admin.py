"""Admin API: Excel faylni saytdan yuklab bazani yangilash.

Himoya: barcha endpointlar X-Admin-Token sarlavhasini talab qiladi.
Token ADMIN_TOKEN muhit o'zgaruvchisida beriladi (standart qiymat quyida).
"""

import os
from collections import Counter
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile

from .. import db
from ..importer import TYPE_PREFIX, read_rows_from_bytes, replace_type


def _load_token() -> str:
    """Parol manbalari (ustuvorlik tartibida):
    1) ADMIN_TOKEN muhit o'zgaruvchisi (deploy uchun);
    2) backend/data/admin_token.txt fayli (lokal, git'ga kirmaydi);
    3) "admin123" — vaqtinchalik standart (README: albatta o'zgartiring).
    """
    env = os.environ.get("ADMIN_TOKEN")
    if env:
        return env
    token_file = Path(__file__).resolve().parents[2] / "data" / "admin_token.txt"
    if token_file.exists():
        return token_file.read_text(encoding="utf-8").strip()
    return "admin123"


ADMIN_TOKEN = _load_token()

TYPE_LABELS = {"allyuziv-nom": "Allyuziv nomlar", "iqtibos": "Iqtiboslar"}


def require_token(x_admin_token: str = Header(default="")) -> None:
    if x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Admin kaliti noto'g'ri")


router = APIRouter(dependencies=[Depends(require_token)])


@router.get("/admin/check")
def check():
    """Kirish kaliti to'g'riligini tekshirish."""
    return {"ok": True}


@router.post("/admin/import")
async def import_excel(
    file: UploadFile = File(...),
    type: str = Form(...),
):
    if type not in TYPE_PREFIX:
        raise HTTPException(status_code=400, detail="Noto'g'ri tur")
    if not (file.filename or "").lower().endswith(".xlsx"):
        raise HTTPException(status_code=400, detail="Faqat .xlsx fayl qabul qilinadi")

    data = await file.read()
    try:
        entries, hint = read_rows_from_bytes(data, type)
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Faylni o'qib bo'lmadi — Excel (.xlsx) formatini tekshiring",
        )
    if not entries:
        raise HTTPException(
            status_code=400,
            detail="Faylda birorta yozuv topilmadi — ustunlar tartibini tekshiring",
        )

    # 3-ustundagi yorliq tanlangan turga zid bo'lsa — ogohlantirish (import baribir bajariladi)
    warnings: list[str] = []
    other = "iqtibos" if type == "allyuziv-nom" else "allyuziv-nom"
    if hint[other] > hint[type]:
        warnings.append(
            f"Diqqat: fayl ichidagi yorliqlar ko'proq «{TYPE_LABELS[other]}» turiga o'xshaydi, "
            f"siz esa «{TYPE_LABELS[type]}» sifatida yukladingiz."
        )

    # ID takrorlarini tekshirish
    dup = [i for i, n in Counter(e["id"] for e in entries).items() if n > 1]
    if dup:
        raise HTTPException(
            status_code=400,
            detail=f"Faylda ID takrorlangan: {', '.join(d.split('-', 1)[1] for d in dup[:5])}",
        )

    replace_type(entries, type)
    db.load()  # xotiradagi keshni yangilash

    all_e = db.all_entries()
    return {
        "imported": len(entries),
        "complete": sum(e["is_complete"] for e in entries),
        "warnings": warnings,
        "total": len(all_e),
        "byType": dict(Counter(e["type"] for e in all_e)),
    }
