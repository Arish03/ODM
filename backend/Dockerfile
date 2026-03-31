# ── Backend Dockerfile (Production-Optimised) ───────────────────────────────
# Stage 1: Builder — installs build tools + compiles Python deps
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.11-slim-bookworm AS builder

# Install build-time system deps (GDAL/GEOS headers + compilers)
# These stay in the builder stage only — never reach the final image
# Use global timeouts for apt and increase retries
RUN apt-get -o Acquire::Retries=10 -o Acquire::http::Timeout="120" update && \
    apt-get -o Acquire::Retries=10 -o Acquire::http::Timeout="120" install -y --no-install-recommends --fix-missing \
        gdal-bin \
        libgdal-dev \
        libgeos-dev \
        libpq-dev \
        gcc \
        g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only requirements first → pip layer is cached unless requirements.txt changes
COPY requirements.txt .

# Upgrade pip first to resolve hash-checking issues in newer releases
RUN pip install --no-cache-dir --upgrade pip

# Pre-install wcwidth to bypass hash corruption issues seen in long builds
RUN pip install --no-cache-dir --retries 20 --timeout 300 \
        --prefix=/install \
        wcwidth==0.6.0

# Install into a prefix directory so runtime stage can copy cleanly
# Increased timeout to 300s and retries to 15 for stability
RUN pip install --no-cache-dir --retries 15 --timeout 300 \
        --prefix=/install \
        -r requirements.txt

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Runtime — lean final image, no compilers, no headers
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.11-slim-bookworm AS runtime

# Only runtime shared libraries needed (no -dev packages, no gcc/g++)
# Only runtime shared libraries needed with timeout protection
RUN apt-get -o Acquire::Retries=10 -o Acquire::http::Timeout="120" update && \
    apt-get -o Acquire::Retries=10 -o Acquire::http::Timeout="120" install -y --no-install-recommends --fix-missing \
        gdal-bin \
        libgeos-c1v5 \
        libpq5 \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Copy compiled Python packages from builder
COPY --from=builder /install /usr/local

WORKDIR /app

# Copy application source
COPY app/ ./app/

# Pre-create runtime directories
RUN mkdir -p /app/uploads /app/tiles

# Run as non-root for security
RUN useradd -m -u 1001 appuser && chown -R appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
