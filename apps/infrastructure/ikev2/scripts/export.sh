#!/bin/bash
client=$1
IKE_SH_PATH=""
clients_directory=$IKE_CLIENTS_DIR
if [[ "$LOCAL_DEBUG" == "true" ]]; then
  echo "Local debug enabled"
  clients_directory="../debug/clients"
  IKE_SH_PATH="./"
fi
echo "Command: ${IKE_SH_PATH}ikev2.sh --exportclient $client"
CONFIG_DIR=$clients_directory ${IKE_SH_PATH}ikev2.sh --exportclient "$client"
if [[ $? -eq 0 ]]; then
  cd $clients_directory || exit
  rm -rf $client
  mkdir -p $client
  mv "$client".* "$client"
  zip -r "$client.zip" "$client"
  mv "$client.zip" "$client"
fi
