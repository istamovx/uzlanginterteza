"""O'zbek lotin matnini qidiruv uchun birxillashtirish.

Excel'da apostrof 5-6 xil belgi bilan yozilgan (ʻ ' ' ` ´). Qidiruvda
foydalanuvchi qaysi belgini terishidan qat'i nazar natija chiqishi uchun
hammasi bitta ' belgisiga keltiriladi.
"""

import re

# U+02BB, U+2018, U+2019, U+0060, U+00B4, U+02BC, U+2032
_APOSTROPHES = "ʻ‘’`´ʼ′'"
_APOSTROPHE_RE = re.compile(f"[{_APOSTROPHES}]")
_WS_RE = re.compile(r"\s+")


def clean(text: str | None) -> str:
    """Ko'rsatish uchun: chetki probellarni olib tashlash, ichki probellarni siqish."""
    if not text:
        return ""
    return _WS_RE.sub(" ", str(text).strip())


def normalize(text: str | None) -> str:
    """Qidiruv uchun: apostroflarni birxillashtirish + kichik harf."""
    if not text:
        return ""
    text = _APOSTROPHE_RE.sub("'", str(text))
    return _WS_RE.sub(" ", text).strip().lower()
