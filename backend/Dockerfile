# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# lib/env.ts validates lazily, so no configuration is needed to build.
RUN npm run build

# One-shot container for `npm run seed`. Built from deps rather than builder
# because seeding runs the TypeScript sources and never needs a Next build.
FROM node:22-alpine AS seeder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["npm", "run", "seed", "--", "--if-empty"]

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=4000 HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# `output: "standalone"` emits a server plus only the modules it imports.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 4000
CMD ["node", "server.js"]
