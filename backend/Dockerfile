# ── Backend Dockerfile ──────────────────────────────────────────
FROM python:3.11-slim

# System dependencies for geospatial libraries (GDAL/GEOS for geopandas/shapely)
# Added Acquire::Retries=5 to handle network resets
RUN apt-get -o Acquire::Retries=5 update && apt-get -o Acquire::Retries=5 install -y --no-install-recommends \
    gdal-bin \
    libgdal-dev \
    libgeos-dev \
    libpq-dev \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first (layer cache optimisation)
COPY requirements.txt .
# Added --retries and --timeout to handle unstable connections (especially ECONNRESET)
RUN pip install --no-cache-dir --retries 10 --timeout 100 -r requirements.txt

# Copy application source
COPY app/ ./app/

# Create persistent volume mount points
RUN mkdir -p /app/uploads /app/tiles

# Expose FastAPI port
EXPOSE 8000

# Run with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
