FROM node:lts-bookworm-slim
WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
COPY src/ ./src

RUN npm ci && npm run build && NODE_ENV=production npm ci --omit=dev
CMD [ "node", "dist/src/index.js" ]