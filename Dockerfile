FROM debian:12
WORKDIR /app

RUN apt-get -yqq update \
    && DEBIAN_FRONTEND=noninteractive \
    apt-get -yqq --no-install-recommends install \
    dnsutils openssl ca-certificates iproute2 unzip zip curl \
    net-tools iptables libnss3-tools \
    && update-alternatives --set iptables /usr/sbin/iptables-legacy \
    && curl -fsSL https://bun.sh/install | bash \
    && export PATH="/root/.bun/bin:$PATH" \
    && /root/.bun/bin/bun --version

# Set PATH for subsequent layers
ENV PATH="/root/.bun/bin:$PATH"

# Copy application files
COPY package.json bun.lockb .env tsconfig.json /app/
COPY src/ ./src
COPY scripts/ ./scripts
# Install production dependencies
RUN bun install --production
EXPOSE 500/udp 4500/udp 51820/udp
CMD [ "bun", "src/main.ts" ]