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
if is_container; then
    CONFIG_DIR="/app/wg-clients"
    echo "[INFO] Running inside a container. Using $CONFIG_DIR for configs."
else
    CONFIG_DIR="./wg-clients"
    echo "[INFO] Running on host. Using $CONFIG_DIR for configs."
fi

mkdir -p "$CONFIG_DIR"

case "$1" in
    --listclients)
        echo "Listing clients (fake response):"
        ls "$CONFIG_DIR"/*.conf 2>/dev/null | sed 's/.*\///; s/\.conf//' || echo "No clients found."
        ;;
    --exportclient)
        if [ -z "$2" ]; then
            echo "Error: Client name not specified."
            exit 1
        fi
        FAKE_CONFIG="$CONFIG_DIR/$2.conf"
        if [ ! -f "$FAKE_CONFIG" ]; then
            echo "Error: Client '$2' does not exist."
            exit 1
        fi
        echo "Exporting fake config for client '$2'..."
        cat "$FAKE_CONFIG"
        ;;
    --addclient)
        if [ -z "$2" ]; then
            echo "Error: Client name not specified."
            exit 1
        fi
        FAKE_CONFIG="$CONFIG_DIR/$2.conf"
        if [ -f "$FAKE_CONFIG" ]; then
            echo "Error: Client '$2' already exists."
            exit 1
        fi
        echo "Creating fake WireGuard config for '$2'..."
        echo "[Interface]
PrivateKey = fake_private_key_$RANDOM
Address = 10.0.0.$((RANDOM % 254 + 1))/24
DNS = 1.1.1.1

[Peer]
PublicKey = fake_server_key_$RANDOM
AllowedIPs = 0.0.0.0/0
Endpoint = fake.vpn.server:51820" > "$FAKE_CONFIG"
        echo "Client '$2' added (fake). Config: $FAKE_CONFIG"
        ;;
    --revokeclient)
        if [ -z "$2" ]; then
            echo "Error: Client name not specified."
            exit 1
        fi
        FAKE_CONFIG="$CONFIG_DIR/$2.conf"
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
        FAKE_CONFIG="$CONFIG_DIR/$2.conf"
        if [ ! -f "$FAKE_CONFIG" ]; then
            echo "Error: Client '$2' does not exist."
            exit 1
        fi
        echo "Deleting fake client '$2'..."
        rm -f "$FAKE_CONFIG"
        echo "Client '$2' deleted (fake)."
        ;;
    *)
        echo "Fake WireGuard setup script (does nothing real)."
        echo "Usage: $0 [--listclients | --exportclient <name> | --addclient <name> | --revokeclient <name> | --deleteclient <name>]"
        exit 1
        ;;
esac