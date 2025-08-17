FROM node:lts-alpine
WORKDIR /users-bot

COPY package.json package-lock.json sheets-api.json .env tsconfig.json /users-bot/
COPY src/ ./src
COPY prisma/ ./prisma
RUN npm install && npm run build && npm ci --omit=dev
CMD [ "node", "dist/src/index.js" ]