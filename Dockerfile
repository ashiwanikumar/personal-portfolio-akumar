# Stage 1 — Dependencies (all deps needed for build)
FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2 — Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN rm -rf apps/api-server/node_modules

ARG BACKEND_API
ARG NEXT_PUBLIC_BACKEND_API
ARG PORT=3302

ENV BACKEND_API=$BACKEND_API
ENV NEXT_PUBLIC_BACKEND_API=$NEXT_PUBLIC_BACKEND_API
ENV PORT=$PORT
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Stage 3 — Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3302

RUN apk add --no-cache curl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextuser

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextuser:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextuser:nodejs /app/.next/static ./.next/static

USER nextuser

EXPOSE 3302

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3302/ || exit 1

CMD ["node", "server.js"]
