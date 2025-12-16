# =========================
# 1. Base Image
# =========================
FROM node:20-alpine AS base
WORKDIR /app

# =========================
# 2. Dependencies Install
# =========================
FROM base AS deps

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm ci

# =========================
# 3. Build Stage
# =========================
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# =========================
# 4. Production Runner
# =========================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Security: non-root user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
