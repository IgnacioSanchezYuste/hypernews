# syntax=docker/dockerfile:1

# ─── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ─── Stage 2: builder ─────────────────────────────────────────────────────────
# `next build` prerenders the public pages (ISR), which read from Postgres —
# DATABASE_URL must point to a reachable database at build time, not a dummy one.
FROM deps AS builder
WORKDIR /app
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
ENV DATABASE_SSL=false
# Never used at runtime (real values come from docker-compose.yml); only long
# enough to satisfy env.ts's validation if anything touches it during the build.
ENV SESSION_SECRET=docker-build-placeholder-3f9a1c7e2b6d4f8091a5c3e7b2d6f9013f9a1c7e2b6d4f80
ENV CRON_SECRET=docker-build-placeholder-3f9a1c7e2b6d4f8091a5c3e7b2d6f9013f9a1c7e2b6d4f80
RUN npm run build

# ─── Stage 3: tools ────────────────────────────────────────────────────────────
# One-off management commands (schema seed, news backfill) need tsx and the full
# devDependencies that the slim runner below intentionally drops.
FROM builder AS tools
WORKDIR /app
ENTRYPOINT []
CMD ["node", "--version"]

# ─── Stage 4: runner ───────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache curl
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Standalone server: only the traced node_modules + server.js, no full install.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]
