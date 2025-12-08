FROM node:lts-alpine
WORKDIR /app
COPY package.json package-lock.json sheets-api.json ./
COPY src/ ./src
COPY prisma/ ./prisma
RUN npm ci && npm run build && NODE_ENV=production npm ci --omit=dev
RUN npx prisma generate

CMD ["node", "dist/src/index.js"]
