#!/bin/bash

client=$1
protocol=$2
# Проверка обязательных параметров
if [[ -z "$client" || -z "$protocol" ]]; then
    echo "Usage: $0 <client_name> <ikev2|wireguard|openvpn>"
    exit 1
fi

case $protocol in
    ikev2)
        ikev2.sh -y --revokeclient "$client"
        ikev2.sh -y --deleteclient "$client"
        ;;
    wireguard)
        wireguard.sh -y --removeclient "$client"
        ;;
    openvpn)
        openvpn.sh -y --revokeclient "$client"
        ;;
    *)
        echo "Error: Unknown protocol '$protocol'"
        echo "Available protocols: ikev2, wireguard, openvpn"
        exit 1
        ;;
esac

if [[ $? -eq 0 ]]; then
    echo "Client '$client' successfully removed from $protocol"
else
    echo "Error: failed to remove client '$client' from $protocol"
    exit 1
fi