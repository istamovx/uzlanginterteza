# Claude Project Study

Generated: 2026-10-02T20:48:24.208Z

# Project study report: O'zbek Intertekstual Tezaurusi

**Scope:** read-only analysis of the supplied snapshot. No files were modified and no commands were run. Nothing below is claimed as tested; findings are from reading source, and anything needing runtime confirmation is marked **(verify)**.

## 1. Understanding

An Uzbek-language thesaurus SPA with a REST API for intertextual units in Ulug'bek Hamdam's works: allyuziv nomlar (`an-*`), iqtiboslar (`iq-*`) and maqollar (`mq-*`).

- **Data flow:** Excel (24-column schema) → `importer.py` → one `entries` table (SQLite locally, PostgreSQL via `DATABASE_URL`) → full in-memory cache in `db.py` → routers → camelCase JSON → React SPA.
- **Production:** one Render Docker web service plus Render PostgreSQL (`render.yaml`). FastAPI serves `frontend/dist` with an SPA fallback.
- **Seeding:** an empty PostgreSQL is seeded once from the committed `backend/data/tezaurus.db`.
- **Data changes:** either `scripts/import_excel.py` (CLI, full rebuild) or `/admin` (replace one type).

### Snapshot gaps (not auditable from what I received)

- **Frontend pages:** `HomePage`, `EntryPage`, `CatalogPage`, `StatsPage` and `NetworkPage` are missing. Their loading/error handling, the audio button, the dictionary/node toggle and the mobile overflow cannot be assessed.
- **Backend and deploy:** `README.md`, `Dockerfile`, `start.bat`, `.gitignore`, `backend/tests/` and the SQLite
