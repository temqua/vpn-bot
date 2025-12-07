# --- Stage 1: Build Go binary ---
FROM golang:1.25-alpine AS builder
WORKDIR /src
COPY ./receiver.go .
COPY ./scripts/ ./scripts/

# собираем статически
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o receiver receiver.go
CMD ["/server/receiver"]
EXPOSE 8090


# --- Stage 2: Final image with IPsec server ---
FROM debian:latest
WORKDIR /server

RUN apt-get update && apt-get -yqq install libnss3-tools libnss3-dev ppp zip unzip

# переносим бинарник
COPY --from=builder /src/receiver /server/receiver
COPY --from=builder /src/scripts /server/scripts

EXPOSE 8090

CMD ["/server/receiver"]
