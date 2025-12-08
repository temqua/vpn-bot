FROM node:lts-alpine
WORKDIR /app
COPY package.json package-lock.json tsconfig.json tsconfig.base.json sheets-api.json ./
COPY src/ ./src
COPY prisma/ ./prisma
RUN npm ci && npm run build && NODE_ENV=production npm ci --omit=dev

CMD ["node", "dist/src/index.js"]
