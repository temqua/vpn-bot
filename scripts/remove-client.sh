#!/bin/bash

# Проверка наличия обязательных аргументов
if [[ $# -lt 2 ]]; then
    echo "Usage: $0 <client_name> <protocol>"
    echo "Available protocols: ikev2, wg, openvpn"
    exit 1
fi

client=$1
protocol=$2

case $protocol in
    ikev2)
        # Удаление клиента IKEv2
        ikev2.sh -y --revokeclient "$client"
        ikev2.sh -y --deleteclient "$client"
        ;;
    wg)
        # Удаление клиента WireGuard
        wireguard.sh -y --removeclient "$client"
        ;;
    openvpn)
        # Удаление клиента OpenVPN
        openvpn.sh -y --revokeclient "$client"
        ;;
    *)
        echo "Error: Unknown protocol '$protocol'"
        echo "Available protocols: ikev2, wg, openvpn"
        exit 1
        ;;
esac

echo "Client '$client' successfully removed from $protocol"