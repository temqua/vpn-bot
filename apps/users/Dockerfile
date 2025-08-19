FROM node:lts-alpine as builder
WORKDIR /app
ENV NODE_OPTIONS="--max-old-space-size=2048"
COPY package.json package-lock.json sheets-api.json .env tsconfig.json ./
COPY src/ ./src
COPY prisma/ ./prisma

RUN npm ci && npm run build

FROM node:lts-alpine
WORKDIR /app
ENV NODE_OPTIONS="--max-old-space-size=2048"
COPY package.json package-lock.json sheets-api.json .env tsconfig.json ./
COPY --from=builder /app/dist ./dist
COPY prisma/ ./prisma
RUN npm ci --omit=dev
RUN npx prisma generate

CMD ["node", "dist/src/index.js"]
