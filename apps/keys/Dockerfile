FROM node:lts-bookworm-slim AS builder
WORKDIR /app

COPY package.json package-lock.json tsconfig.json .env ./
COPY src/ ./src
COPY scripts/ ./scripts

RUN npm ci && npm run build

FROM node:lts-bookworm-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \ 
    qrencode wireguard apt-utils \
    wget dnsutils openssl ca-certificates iproute2 unzip zip curl \
    net-tools iptables libnss3-tools 

COPY package.json package-lock.json .env tsconfig.json ./
COPY scripts/ ./scripts
COPY --from=builder /app/dist ./dist
RUN npm ci --omit=dev

CMD [ "node", "dist/src/index.js" ]