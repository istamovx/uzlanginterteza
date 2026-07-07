from fastapi import APIRouter, Query

from .. import db, search

router = APIRouter()


@router.get("/search")
def search_entries(q: str = Query(..., min_length=1), limit: int = Query(20, ge=1, le=50)):
    outcome = search.search(db.all_entries(), q, limit)
    return {
        "query": outcome["query"],
        "results": [
            {**db.summary(e), "score": s} for s, e in outcome["results"]
        ],
        "suggestions": [db.summary(e) for e in outcome["suggestions"]],
    }
