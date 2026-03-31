# ── Frontend Dockerfile (Production-Optimised) ──────────────────────────────
# Stage 1: Builder — installs deps and builds the React app
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy only package files first → npm install layer is cached
# unless package.json or package-lock.json changes
COPY package.json package-lock.json ./

# Use the official npm registry and increase resilience settings
# maxsockets=5 helps with unstable connections; fetch-timeout=600000 (10 mins)
RUN npm config set fetch-retries 10 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 600000 && \
    npm config set maxsockets 5 && \
    npm ci --no-audit --no-fund

# Copy source after install so code changes don't bust the dep cache
COPY . .

# Build for production
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Runtime — lean Nginx image, only static assets
# ─────────────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Run as non-root for security
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]