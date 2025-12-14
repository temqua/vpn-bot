FROM oven/bun:alpine
WORKDIR /backups

RUN echo 'https://dl-cdn.alpinelinux.org/alpine/edge/main/' > /etc/apk/repositories
RUN apk update && apk upgrade && apk add postgresql17-client
COPY package.json bun.lock .env tsconfig.json /backups/
COPY src/ ./src
RUN bun install --production --frozen-lockfile
CMD [ "bun", "src/index.ts" ]