#!/bin/bash
client=$1
IKE_SH_PATH=""
clients_directory=$IKE_CLIENTS_DIR
if [[ "$LOCAL_DEBUG" == "true" ]]; then
  echo "Local debug enabled"
  clients_directory="../debug/clients"
  IKE_SH_PATH="./"
  mkdir -p $clients_directory
fi

echo "Creating IKEv2 client $client"
mkdir -p "$clients_directory/$client"
echo "Command: ${IKE_SH_PATH}ikev2.sh --addclient $client"
CONFIG_DIR=$clients_directory ${IKE_SH_PATH}ikev2.sh --addclient "$client"
if [[ $? -eq 0 ]]; then
  cd $clients_directory || exit
  mv "$client".* "$client"
  zip -r "$client.zip" "$client"
  mv "$client.zip" "$client"
fi
