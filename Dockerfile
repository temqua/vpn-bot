FROM node:18-slim AS build
WORKDIR /bot
COPY . .
RUN npm ci
EXPOSE 45532
CMD ["npm", "start"]

