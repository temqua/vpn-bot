#!/bin/bash
client=$1

WG_SH_PATH=""
main_directory=$WG_CERT_DIR
directory="clients"
if [[ "$LOCAL_DEBUG" == "true" ]]; then
  echo "Local debug enabled"
  main_directory="../debug"
  WG_SH_PATH="./"
fi

echo "Command ${WG_SH_PATH}wireguard.sh --removeclient -y $client"
CONFIG_DIR=$main_directory/$directory/$client ${WG_SH_PATH}wireguard.sh -y --removeclient "$client"
if [[ $? -eq 0 ]]; then
    echo "Remove command: rm -rf $main_directory/$directory/$client" 
    rm -rf "$main_directory/$directory/$client"  
    echo "Client '$client' successfully removed from wireguard"
else
    echo "Error: failed to remove client '$client' from wireguard"
    exit 1
fi
