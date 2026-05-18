FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache python3 make g++ \
    cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev \
    pixman-dev pkgconfig

COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache cairo pango jpeg giflib librsvg pixman

RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN chown -R nodeuser:nodejs /app
USER nodeuser

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "server.js"]
