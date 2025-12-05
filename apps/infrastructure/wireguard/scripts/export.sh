#!/bin/bash
client=$1
WG_SH_PATH=""
main_cert_directory=$WG_CERT_DIR
directory="clients"
if [[ "$LOCAL_DEBUG" == "true" ]]; then
  echo "Local debug enabled"
  main_cert_directory="../debug"
  WG_SH_PATH="./"
fi
echo "Command: sudo bash ${WG_SH_PATH}wireguard.sh --exportclient $client"
sudo bash ${WG_SH_PATH}wireguard.sh --exportclient "$client"
if [[ $? -eq 0 ]]; then
  cd $main_cert_directory || exit
  rm -rf $directory/$client
  mv "$client.conf" "$directory/$client"
  cd "$directory/$client"
  qrencode -o "$client.png" -t PNG < "$client".conf  
fi
