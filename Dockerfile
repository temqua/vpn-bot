FROM debian:bullseye-slim AS build-bun

# https://github.com/oven-sh/bun/releases
ARG BUN_VERSION=latest

RUN apt-get update -qq \
    && apt-get install -qq --no-install-recommends \
      ca-certificates \
      curl \
      dirmngr \
      gpg \
      gpg-agent \
      unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && arch="$(dpkg --print-architecture)" \
    && case "${arch##*-}" in \
      amd64) build="x64-baseline";; \
      arm64) build="aarch64";; \
      *) echo "error: unsupported architecture: $arch"; exit 1 ;; \
    esac \
    && version="$BUN_VERSION" \
    && case "$version" in \
      latest | canary | bun-v*) tag="$version"; ;; \
      v*)                       tag="bun-$version"; ;; \
      *)                        tag="bun-v$version"; ;; \
    esac \
    && case "$tag" in \
      latest) release="latest/download"; ;; \
      *)      release="download/$tag"; ;; \
    esac \
    && curl "https://github.com/oven-sh/bun/releases/$release/bun-linux-$build.zip" \
      -fsSLO \
      --compressed \
      --retry 5 \
      || (echo "error: failed to download: $tag" && exit 1) \
    && for key in \
      "F3DCC08A8572C0749B3E18888EAB4D40A7B22B59" \
    ; do \
      gpg --batch --keyserver hkps://keys.openpgp.org --recv-keys "$key" \
      || gpg --batch --keyserver keyserver.ubuntu.com --recv-keys "$key" ; \
    done \
    && curl "https://github.com/oven-sh/bun/releases/$release/SHASUMS256.txt.asc" \
      -fsSLO \
      --compressed \
      --retry 5 \
    && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
      || (echo "error: failed to verify: $tag" && exit 1) \
    && grep " bun-linux-$build.zip\$" SHASUMS256.txt | sha256sum -c - \
      || (echo "error: failed to verify: $tag" && exit 1) \
    && unzip "bun-linux-$build.zip" \
    && mv "bun-linux-$build/bun" /usr/local/bin/bun \
    && rm -f "bun-linux-$build.zip" SHASUMS256.txt.asc SHASUMS256.txt \
    && chmod +x /usr/local/bin/bun \
    && which bun \
    && bun --version

FROM debian:12-slim as bun-init
# Disable the runtime transpiler cache by default inside Docker containers.
# On ephemeral containers, the cache is not useful
ARG BUN_RUNTIME_TRANSPILER_CACHE_PATH=0
ENV BUN_RUNTIME_TRANSPILER_CACHE_PATH=${BUN_RUNTIME_TRANSPILER_CACHE_PATH}

# Ensure `bun install -g` works
ARG BUN_INSTALL_BIN=/usr/local/bin
ENV BUN_INSTALL_BIN=${BUN_INSTALL_BIN}

COPY --from=build-bun /usr/local/bin/bun /usr/local/bin/bun

RUN groupadd bun \
    --gid 1000 \
    && useradd bun \
    --uid 1000 \
    --gid bun \
    --shell /bin/sh \
    --create-home \
    && ln -s /usr/local/bin/bun /usr/local/bin/bunx \
    && which bun \
    && which bunx \
    && bun --version

FROM bun-init as ikev2-install
ENV SWAN_VER=5.1
WORKDIR /opt/src

RUN apt-get -yqq update \
    && DEBIAN_FRONTEND=noninteractive \
    apt-get -yqq --no-install-recommends install \
    wget dnsutils openssl ca-certificates kmod iproute2 \
    gawk net-tools iptables bsdmainutils libcurl3-nss \
    libnss3-tools libevent-dev uuid-runtime xl2tpd \
    libnss3-dev libnspr4-dev pkg-config libpam0g-dev \
    libcap-ng-dev libcap-ng-utils libselinux1-dev \
    libcurl4-nss-dev flex bison gcc make \
    && wget -t 3 -T 30 -nv -O libreswan.tar.gz "https://github.com/libreswan/libreswan/archive/v${SWAN_VER}.tar.gz" \
    || wget -t 3 -T 30 -nv -O libreswan.tar.gz "https://download.libreswan.org/libreswan-${SWAN_VER}.tar.gz" \
    && tar xzf libreswan.tar.gz \
    && rm -f libreswan.tar.gz \
    && cd "libreswan-${SWAN_VER}" \
    && printf 'WERROR_CFLAGS=-w -s\nUSE_DNSSEC=false\nUSE_SYSTEMD_WATCHDOG=false\n' > Makefile.inc.local \
    && printf 'USE_DH2=true\nUSE_NSS_KDF=false\nFINALNSSDIR=/etc/ipsec.d\nNSSDIR=/etc/ipsec.d\n' >> Makefile.inc.local \
    && make -s base \
    && make -s install-base \
    && cd /opt/src \
    && rm -rf "/opt/src/libreswan-${SWAN_VER}" \
    && apt-get -yqq remove \
    libnss3-dev libnspr4-dev pkg-config libpam0g-dev \
    libcap-ng-dev libcap-ng-utils libselinux1-dev \
    libcurl4-nss-dev flex bison gcc make \
    && apt-get -yqq autoremove \
    && apt-get -y clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /var/log/* \
    && update-alternatives --set iptables /usr/sbin/iptables-legacy

FROM ikev2-install as app
WORKDIR /app
COPY package.json bun.lockb .env tsconfig.json /app/
COPY src/ ./src
COPY scripts/ ./scripts
RUN apt update && apt install -y zip
RUN bun install --production
EXPOSE 500/udp 4500/udp 51820/udp
CMD [ "bun", "src/main.ts" ]