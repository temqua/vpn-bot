FROM vpn-base
WORKDIR /app

COPY package.json package-lock.json .env ./
COPY scripts/ ./scripts
COPY dist/ ./dist
RUN npm ci --omit=dev

CMD [ "node", "dist/src/index.js" ]