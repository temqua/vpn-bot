#!/bin/bash
client=$1
WG_SH_PATH=""
main_cert_directory=$WG_CERT_DIR
directory="clients"
if [[ "$LOCAL_DEBUG" == "true" ]]; then
  echo "Local debug enabled"
  main_cert_directory="../debug"
  WG_SH_PATH="./"
  mkdir -p $main_cert_directory
fi

echo "Creating WireGuard client $client"

mkdir -p "$main_cert_directory/$directory"
mkdir -p "$main_cert_directory/$directory/$client"
echo "Command: ${WG_SH_PATH}wireguard.sh --addclient $client"
CONFIG_DIR=$main_cert_directory ${WG_SH_PATH}wireguard.sh --addclient "$client"
if [[ $? -eq 0 ]]; then
  cd $main_cert_directory || exit
  mkdir -p "$directory/$client"
  mv "$client.conf" "$directory/$client"
  cd "$directory/$client"
  qrencode -o "$client.png" -t PNG < "$client".conf  
fi
