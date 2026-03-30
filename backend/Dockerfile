# ── Backend Dockerfile ──────────────────────────────────────────
# Use 'bookworm' (Stable) instead of the default to ensure mirror compatibility
FROM python:3.11-slim-bookworm

# System dependencies for geospatial libraries (GDAL/GEOS)
# Increased retries to handle unstable connections
RUN apt-get -o Acquire::Retries=10 update && \
    apt-get -o Acquire::Retries=10 install -y --no-install-recommends --fix-missing \
    gdal-bin libgdal-dev libgeos-dev libpq-dev gcc g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .

# High-retries and long timeout for Pip
RUN pip install --no-cache-dir --retries 10 --timeout 100 -r requirements.txt

COPY app/ ./app/
RUN mkdir -p /app/uploads /app/tiles
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
