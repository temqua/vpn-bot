FROM oven/bun:debian AS base
WORKDIR /app
COPY package.json bun.lockb .env tsconfig.json /app/
COPY src/ ./src
COPY scripts/ ./scripts
RUN bun install
CMD [ "bun", "src/main.ts" ]