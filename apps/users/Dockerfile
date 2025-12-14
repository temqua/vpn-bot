FROM oven/bun:latest
WORKDIR /app
COPY package.json bun.lock tsconfig.json tsconfig.base.json sheets-api.json ./
COPY src/ ./src
COPY prisma/ ./prisma
RUN bun install --frozen-lockfile && bunx prisma generate && bun install --omit dev --frozen-lockfile

CMD ["bun", "src/index.ts"]
