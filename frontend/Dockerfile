# ── Frontend Dockerfile ─────────────────────────────────────────
# Stage 1: Build the React/Vite app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
# Use a mirror and disable heavy checks to reduce network load
RUN npm config set registry https://registry.npmmirror.com/ && \
    npm config set fetch-retries 10 && \
    npm config set fetch-retry-maxtimeout 1000000 && \
    npm install --no-audit --no-fund

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom Nginx config to handle React Router (SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
