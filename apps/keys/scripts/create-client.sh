#!/bin/bash
client=$1
protocol=$2

# Проверка обязательных параметров
if [[ -z "$client" || -z "$protocol" ]]; then
    echo "Usage: $0 <client_name> <ikev2|wg|openvpn>"
    exit 1
fi

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
# Выбираем путь для конфигов в зависимости от окружения
if is_container; then
    IKE_DIR=$IKE_CONTAINER_DIR
    WG_DIR=$WG_CONTAINER_DIR
    OVPN_DIR=$OVPN_CONTAINER_DIR
    echo "[INFO] Running inside a container. Using $CONFIG_DIR for configs."
else
    IKE_DIR="./ikev2-clients"
    WG_DIR="./wg-clients"
    OVPN_DIR="./ovpn-clients"
    echo "[INFO] Running on host. Using $CONFIG_DIR for configs."
fi

case $protocol in
    ikev2)
        directory=$IKE_DIR
        echo "Creating IKEv2 client $client in $directory"
        mkdir -p "$directory/$client"
        ikev2.sh --addclient "$client"
        cd /root || exit
        mv "$client".* "$directory/$client"
        cd "$directory" || exit
        zip -r "$client.zip" "$client"
        mv "$client.zip" "$client"
        ;;
    wg)
        directory=$WG_DIR
        echo "Creating WireGuard client $client in $directory"
        wireguard.sh --addclient "$client"
        cd /root || exit
        mv "$client.conf" "$directory"
        ;;
    openvpn)
        directory=$OVPN_DIR
        echo "Creating OpenVPN client $client in $directory"
        openvpn.sh --addclient "$client"
        cd /root || exit
		mv "$client.ovpn" "$directory"
        ;;
    *)
        echo "Unknown protocol: $protocol. Supported: ikev2, wireguard, openvpn"
        exit 1
        ;;
esac

# Установка правильных прав
# chown -R vpnadmin:vpnadmin "$directory"
echo "Client $client for $protocol created successfully in $directory"