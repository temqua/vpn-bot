FROM debian:12
WORKDIR /app

RUN apt-get -yqq update \
    && DEBIAN_FRONTEND=noninteractive \
    apt-get -yqq --no-install-recommends install \
    wget dnsutils openssl ca-certificates kmod iproute2 \
    gawk net-tools iptables bsdmainutils libcurl3-nss \
    libnss3-tools libevent-dev uuid-runtime xl2tpd \
    && apt-get -yqq autoremove \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /var/log/* \
    && update-alternatives --set iptables /usr/sbin/iptables-legacy

# Install Bun
RUN apt -yqq update && apt install -y curl unzip zip && curl -fsSL https://bun.sh/install | bash \
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