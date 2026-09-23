# O‘ZBEK INTERTEKSTUAL TEZAURUSI — bitta konteyner (Render / Railway / Fly / VPS).
# 1-bosqich: frontend build
FROM node:22-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 2-bosqich: Python server (frontend/dist ni o'zi tarqatadi)
FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt
COPY backend/ backend/
COPY --from=frontend /app/frontend/dist frontend/dist

WORKDIR /app/backend
EXPOSE 8000
# Render/Railway PORT o'zgaruvchisini beradi; lokalda 8000
CMD python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
