# ── Quantfolio Frontend — React + Vite → Nginx ──────────────────────────────
# Multi-stage build: Node builds the static bundle, Nginx serves it.

# ── Stage 1: build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Cache node_modules layer independently from source code
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copy source and build the production bundle
COPY . .
RUN npm run build

# ── Stage 2: serve with Nginx ────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove the default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the Vite build output
COPY --from=build /app/dist /usr/share/nginx/html

# Custom Nginx config:
#   - Single-page-app fallback (all unknown routes → index.html)
#   - Proxy /api/* → backend service so the browser never crosses origins
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
