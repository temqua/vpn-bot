FROM node:lts-bookworm-slim
WORKDIR /app


RUN apt-get update && apt-get install -y --no-install-recommends \ 
    qrencode wireguard apt-utils \
    wget dnsutils openssl ca-certificates iproute2 unzip zip curl \
    net-tools iptables libnss3-tools 
COPY package.json bun.lockb .env sheets-api.json tsconfig.json ./
COPY src/ ./src
COPY prisma/ ./prisma
COPY scripts/ ./scripts
RUN npm install -g bun && bun install --production
CMD [ "bun", "start" ]