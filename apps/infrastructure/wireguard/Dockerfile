FROM golang:1.25-alpine AS builder
WORKDIR /src
COPY ./receiver.go .
COPY ./scripts/ ./scripts/

# собираем статически
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o receiver receiver.go

# --- Stage 2: Final image with WireGuard ---
FROM alpine

WORKDIR /server

RUN apk update && apk add bash && apk add wget && wget -O wireguard.sh https://get.vpnsetup.net/wg
RUN chmod +x wireguard.sh && mv wireguard.sh /usr/bin && bash wireguard.sh <<ANSWERS
n
51822
client
2
y
ANSWERS
# переносим бинарник
COPY --from=builder /src/receiver /server/receiver
COPY --from=builder /src/scripts /server/scripts

EXPOSE 8091

CMD ["/server/receiver"]
