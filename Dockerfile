FROM node:lts-bookworm-slim
WORKDIR /app

COPY package.json bun.lockb .env sheets-api.json tsconfig.json ./
COPY src/ ./src
COPY prisma/ ./prisma
COPY scripts/ ./scripts
RUN npm install -g bun && bun install --production
CMD [ "bun", "start" ]