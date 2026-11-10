"""O'zbek lotin matnini qidiruv uchun birxillashtirish.

Excel'da apostrof 5-6 xil belgi bilan yozilgan (ʻ ' ' ` ´). Qidiruvda
foydalanuvchi qaysi belgini terishidan qat'i nazar natija chiqishi uchun
hammasi bitta ' belgisiga keltiriladi. Tire variantlari (‒ – — −) ham
oddiy "-" ga keltiriladi: klaviaturada faqat "-" bor.
"""

import re

# U+02BB, U+2018, U+2019, U+0060, U+00B4, U+02BC, U+2032
APOSTROPHES = "ʻ‘’`´ʼ′'"
# U+2012, U+2013, U+2014, U+2015, U+2212, U+2010, U+2011
DASHES = "‒–—―−‐‑-"

_CHAR_MAP = str.maketrans({**{c: "'" for c in APOSTROPHES}, **{c: "-" for c in DASHES}})
_WS_RE = re.compile(r"\s+")


def clean(text: str | None) -> str:
    """Ko'rsatish uchun: chetki probellarni olib tashlash, ichki probellarni siqish."""
    if not text:
        return ""
    return _WS_RE.sub(" ", str(text).strip())


def char_normalize(text: str) -> str:
    """Uzunlikni o'zgartirmaydigan normalizatsiya (matn tahlilida pozitsiyalar
    saqlanishi uchun): apostrof va tire variantlari birxillashadi, kichik harf."""
    return str(text).translate(_CHAR_MAP).lower()


def normalize(text: str | None) -> str:
    """Qidiruv uchun: apostrof/tire variantlarini birxillashtirish + kichik harf."""
    if not text:
        return ""
    return _WS_RE.sub(" ", char_normalize(text)).strip()
