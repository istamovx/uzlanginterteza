from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from . import db
from .routers import admin, entries, graph_router, search_router

app = FastAPI(
    title="O'zbek intertekstual tezaurusi API",
    description="Ulug'bek Hamdam asarlaridagi allyuziv nomlar va iqtiboslar tezaurusi",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(entries.router, prefix="/api", tags=["entries"])
app.include_router(search_router.router, prefix="/api", tags=["search"])
app.include_router(graph_router.router, prefix="/api", tags=["graph"])
app.include_router(admin.router, prefix="/api", tags=["admin"])


@app.on_event("startup")
def startup() -> None:
    db.load()


# Frontend build (production): backend o'zi tarqatadi, bitta server yetadi
_dist = Path(__file__).resolve().parents[2] / "frontend" / "dist"
if _dist.exists():
    app.mount("/assets", StaticFiles(directory=_dist / "assets"), name="assets")

    @app.get("/{path:path}", include_in_schema=False)
    def spa(path: str):
        file = _dist / path
        if path and file.is_file():
            return FileResponse(file)
        # index.html keshlanmasin — yangi build darhol ko'rinadi
        # (assets/ fayllari nomida hash bor, ularni keshlash xavfsiz)
        return FileResponse(_dist / "index.html", headers={"Cache-Control": "no-cache"})
