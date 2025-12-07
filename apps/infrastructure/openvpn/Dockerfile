FROM golang:1.25-alpine AS builder
WORKDIR /src
COPY ./receiver.go .
COPY ./scripts/ ./scripts/

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o receiver receiver.go


FROM debian:latest

WORKDIR /server

RUN apt-get update && apt-get install -yqq openvpn

COPY --from=builder /src/receiver /server/receiver
COPY --from=builder /src/scripts /server/scripts

EXPOSE 8092

CMD ["/server/receiver"]
