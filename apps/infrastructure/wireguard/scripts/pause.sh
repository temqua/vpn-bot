#!/bin/bash
client=$1
if [[ -z $client ]]; then
  echo "You should enter client"
  exit 1
fi
wg set wg0 peer "$(sed -n "/^# BEGIN_PEER $client$/,\$p" "$WG_CONF" | grep -m 1 PublicKey | cut -d " " -f 3)" remove
if [[ $? -eq 0 ]]; then
    echo "Client '$client' has been successfully paused"
else
    echo "Error: failed to pause client '$client' from wireguard"
    exit 1
fi