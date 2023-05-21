FROM node:18-alpine AS build
WORKDIR /bot
COPY . .
RUN npm ci
EXPOSE 45532
CMD ["npm", "start"]