"""Fuzzy qidiruv: rapidfuzz + normalizatsiya.

Reyting tartibi:
  1. Aniq moslik (unit) — 100
  2. Prefiks moslik — 95
  3. Ichida uchrashi (substring) — 88
  4. Fuzzy (WRatio) — maydon og'irligi bilan
"""

from rapidfuzz import fuzz

from .normalize import normalize

# maydon og'irliklari (ARCHITECTURE.md §5)
_WEIGHTS = {
    "unit": 1.0,
    "pronunciations": 0.9,
    "synonyms": 0.85,
    "hypernym": 0.6,
    "contextText": 0.45,
}

MIN_SCORE = 55  # bundan past natija "taklif" hisoblanadi


def _field_score(q: str, value: str) -> float:
    if not value:
        return 0.0
    if value == q:
        return 100.0
    if value.startswith(q):
        return 95.0
    if q in value:
        return 88.0
    return fuzz.WRatio(q, value)


def score_entry(q: str, norm: dict) -> float:
    best = 0.0
    for field, weight in _WEIGHTS.items():
        value = norm[field]
        values = value if isinstance(value, list) else [value]
        for v in values:
            s = _field_score(q, v) * weight
            if s > best:
                best = s
    return best


def search(entries: list[dict], query: str, limit: int = 20) -> dict:
    q = normalize(query)
    if not q:
        return {"query": query, "results": [], "suggestions": []}

    scored = sorted(
        ((score_entry(q, e["_norm"]), e) for e in entries),
        key=lambda t: (-t[0], t[1]["_norm"]["unit"]),
    )
    results = [(s, e) for s, e in scored if s >= MIN_SCORE][:limit]
    suggestions = []
    if not results:
        # eng yaqin 5 ta taklif ("Balki bularni izlagandirsiz")
        suggestions = [e for s, e in scored[:5] if s > 20]
    return {
        "query": query,
        "results": [(round(s, 1), e) for s, e in results],
        "suggestions": suggestions,
    }
