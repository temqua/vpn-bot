FROM vpn-base
WORKDIR /app

RUN apt-get update && apt-get install -y curl gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json .env ./
COPY scripts/ ./scripts
COPY dist/ ./dist
RUN npm ci --omit=dev

CMD [ "node", "dist/src/index.js" ]