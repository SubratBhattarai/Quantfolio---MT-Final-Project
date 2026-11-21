# ── Quantfolio Backend — FastAPI + Uvicorn ──────────────────────────────────
# Multi-stage build: deps layer cached separately from source for fast rebuilds.

# ── Stage 1: dependency installer ───────────────────────────────────────────
FROM python:3.12-slim AS deps

WORKDIR /install

# Copy only the requirements file first so this layer is cached as long as
# requirements.txt hasn't changed.
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# ── Stage 2: runtime image ───────────────────────────────────────────────────
FROM python:3.12-slim AS runtime

# Create a non-root user for security
RUN addgroup --system quantfolio && adduser --system --ingroup quantfolio quantfolio

WORKDIR /app

# Copy installed packages from the deps stage
COPY --from=deps /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin

# Copy the backend source (the entire backend/ package)
COPY . ./backend/

# SQLite data directory — mount a volume here in production to persist the DB
RUN mkdir -p /app/data \
 && chown -R quantfolio:quantfolio /app

# Tell SQLAlchemy / database.py where to store the SQLite file.
# Override with an env var when using a hosted DB (Postgres, etc.)
ENV DB_PATH=/app/data/quantfolio.db \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

USER quantfolio

EXPOSE 8000

# Run with uvicorn; --host 0.0.0.0 so the container port is reachable.
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
