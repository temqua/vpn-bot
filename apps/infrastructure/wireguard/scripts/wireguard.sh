#!/bin/bash

# Parse global flags
AUTO_YES=false

# Соберём новые аргументы без -y
ARGS=()
for arg in "$@"; do
    if [ "$arg" = "-y" ]; then
        AUTO_YES=true
    else
        ARGS+=("$arg")
    fi
done

# Перезапишем позиционные параметры
set -- "${ARGS[@]}"

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
        mkdir -p "$CONFIG_DIR"
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
    --removeclient)
        if [ -z "$2" ]; then
            echo "Error: Client name not specified."
            exit 1
        fi
                
        FAKE_CONFIG="$CONFIG_DIR/$2.conf"
        if [ ! -f "$FAKE_CONFIG" ]; then
            echo "Error: Client '$2' does not exist."
            exit 1
        fi
        if [ "$AUTO_YES" = false ]; then
            read -rp "Are you sure you want to delete client '$2'? [y/N] " answer
            case "$answer" in
                y|Y) ;;
                *) echo "Canceled."; exit 1 ;;
            esac
        fi        
        echo "Deleting fake client '$2'..."
        rm -f "$FAKE_CONFIG"
        echo "Client '$2' deleted (fake)."
        ;;
    *)
        echo "Fake WireGuard setup script (does nothing real)."
        echo "Usage: $0 [--listclients | --exportclient <name> | --addclient <name> | --removeclient <name>]"
        exit 1
        ;;
esac