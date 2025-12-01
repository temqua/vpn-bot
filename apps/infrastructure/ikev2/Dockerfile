# --- Stage 1: Build Go binary ---
FROM golang:1.25-alpine AS builder
WORKDIR /src
COPY ./receiver.go .
COPY ./scripts/ ./scripts/

# собираем статически
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o receiver receiver.go


# --- Stage 2: Final image with IPsec server ---
FROM hwdsl2/ipsec-vpn-server

WORKDIR /server

RUN apk update && apk add zip unzip

# переносим бинарник
COPY --from=builder /src/receiver /server/receiver
COPY --from=builder /src/scripts /server/scripts

EXPOSE 8090

CMD ["/server/receiver"]
