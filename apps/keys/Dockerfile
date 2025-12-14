FROM oven/bun:latest
WORKDIR /app

COPY package.json bun.lock tsconfig.json ./
COPY src/ ./src

RUN bun install --production --frozen-lockfile
CMD [ "bun", "src/index.ts" ]