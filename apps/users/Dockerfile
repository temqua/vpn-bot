FROM node:lts-alpine
WORKDIR /app
COPY package.json package-lock.json sheets-api.json ./
COPY dist/ ./dist
COPY prisma/ ./prisma
RUN NODE_ENV=production npm ci --omit=dev
RUN npx prisma generate

CMD ["node", "dist/src/index.js"]
