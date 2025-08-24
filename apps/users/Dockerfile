FROM node:lts-alpine AS builder
WORKDIR /app
ENV NODE_OPTIONS="--max-old-space-size=1536"
COPY package.json package-lock.json sheets-api.json .env tsconfig.js1ю5on ./
COPY src/ ./src
COPY prisma/ ./prisma

RUN npm install -g npm && npm ci
RUN npm run build

FROM node:lts-alpine
WORKDIR /app
COPY package.json package-lock.json sheets-api.json .env tsconfig.json ./
COPY --from=builder /app/dist ./dist
COPY prisma/ ./prisma
RUN npm ci --omit=dev
RUN npx prisma generate

CMD ["node", "dist/src/index.js"]
