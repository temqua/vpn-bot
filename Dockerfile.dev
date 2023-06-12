FROM node:18-alpine AS build
WORKDIR /bot
COPY . .
RUN chmod 101 wireguard*.sh 
RUN apk add wireguard-tools ca-certificates libqrencode wget curl bash
RUN ./wireguard-install.sh --auto
RUN npm ci
EXPOSE 45532
EXPOSE 51820
CMD ["npm", "start"]