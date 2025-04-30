#!/bin/bash

# Проверяем, запущен ли скрипт в контейнере
is_container() {
    # Проверка 1: /.dockerenv (самый надёжный способ для Docker)
    if [ -f "/.dockerenv" ]; then
        return 0
    fi
    # 2. Проверка /proc/1/cgroup (более точная)
    if [ -f "/proc/1/cgroup" ]; then
        # Ищем docker, lxc, kubepods без совпадения с хостовыми путями
        if grep -q "docker\|lxc\|kubepods" /proc/1/cgroup 2>/dev/null && 
           ! grep -q "0::/" /proc/1/cgroup 2>/dev/null; then
            return 0
        fi
    fi

    return 1
}
CONFIG_DIR="/app/ovpn-clients"
# Выбираем путь для конфигов в зависимости от окружения
if is_container; then
    CONFIG_DIR="/app/ovpn-clients"
    echo "[INFO] Running inside a container. Using $CONFIG_DIR for configs."
else
    CONFIG_DIR="./ovpn-clients"  # Для локального запуска
    echo "[INFO] Running on host. Using $CONFIG_DIR for configs."
fi

CONFIG_DIR="./ovpn-clients"
mkdir -p "$CONFIG_DIR"

case "$1" in
    --listclients)
        echo "Listing clients (fake response):"
        ls "$CONFIG_DIR"/*.ovpn 2>/dev/null | sed 's/.*\///; s/\.ovpn//' || echo "No clients found."
        ;;
    --exportclient)
        if [ -z "$2" ]; then
            echo "Error: Client name not specified."
            exit 1
        fi
        FAKE_CONFIG="$CONFIG_DIR/$2.ovpn"
        if [ ! -f "$FAKE_CONFIG" ]; then
            echo "Error: Client '$2' does not exist."
            exit 1
        fi
        echo "Exporting fake OpenVPN config for client '$2'..."
        cat "$FAKE_CONFIG"
        ;;
    --addclient)
        if [ -z "$2" ]; then
            echo "Error: Client name not specified."
            exit 1
        fi
        FAKE_CONFIG="$CONFIG_DIR/$2.ovpn"
        if [ -f "$FAKE_CONFIG" ]; then
            echo "Error: Client '$2' already exists."
            exit 1
        fi
        echo "Creating fake OpenVPN config for '$2'..."
        echo "client
dev tun
proto udp
remote fake.openvpn.server 1194
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-CBC
verb 3
<ca>
-----BEGIN FAKE CERT-----
MII...Fake...Base64...Data...DDD=
-----END FAKE CERT-----
</ca>
<cert>
-----BEGIN FAKE CERT-----
MII...Fake...Client...Cert...EEE=
-----END FAKE CERT-----
</cert>
<key>
-----BEGIN FAKE KEY-----
MII...Fake...Private...Key...FFF=
-----END FAKE KEY-----
</key>" > "$FAKE_CONFIG"
        echo "Client '$2' added (fake). Config: $FAKE_CONFIG"
        ;;
    --revokeclient)
        if [ -z "$2" ]; then
            echo "Error: Client name not specified."
            exit 1
        fi
        FAKE_CONFIG="$CONFIG_DIR/$2.ovpn"
        if [ ! -f "$FAKE_CONFIG" ]; then
            echo "Error: Client '$2' does not exist."
            exit 1
        fi
        echo "Revoking (but not deleting) fake client '$2'..."
        mv "$FAKE_CONFIG" "$CONFIG_DIR/$2.revoked"
        echo "Client '$2' revoked (fake)."
        ;;
    --deleteclient)
        if [ -z "$2" ]; then
            echo "Error: Client name not specified."
            exit 1
        fi
        FAKE_CONFIG="$CONFIG_DIR/$2.ovpn"
        if [ ! -f "$FAKE_CONFIG" ]; then
            echo "Error: Client '$2' does not exist."
            exit 1
        fi
        echo "Deleting fake client '$2'..."
        rm -f "$FAKE_CONFIG"
        echo "Client '$2' deleted (fake)."
        ;;
    *)
        echo "Fake OpenVPN setup script (does nothing real)."
        echo "Usage: $0 [--listclients | --exportclient <name> | --addclient <name> | --revokeclient <name> | --deleteclient <name>]"
        exit 1
        ;;
esac