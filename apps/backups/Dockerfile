FROM node:lts-alpine
WORKDIR /backups

RUN echo 'http://dl-cdn.alpinelinux.org/alpine/edge/main' > /etc/apk/repositories
RUN apk update && apk upgrade && apk add postgresql17-client
COPY package.json package-lock.json .env tsconfig.json /backups/
COPY src/ ./src
RUN npm install && npm run build && npm ci --omit=dev
CMD [ "node", "dist/src/index.js" ]