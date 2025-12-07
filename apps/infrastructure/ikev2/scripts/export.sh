#!/bin/bash
client=$1
IKE_SH_PATH=""
clients_directory=$IKE_CLIENTS_DIR
if [[ "$LOCAL_DEBUG" == "true" ]]; then
  echo "Local debug enabled"
  clients_directory="../debug/clients"
  IKE_SH_PATH="./"
fi
if [[ -z $client ]]
  echo "You should enter client"
  exit 1
fi
echo "Exporting IKEv2 client $client" 
mkdir -p "$clients_directory/$client"
echo "Command: ${IKE_SH_PATH}ikev2.sh --exportclient $client"
CONFIG_DIR=$clients_directory ${IKE_SH_PATH}ikev2.sh --exportclient "$client"
if [[ $? -eq 0 ]]; then
  rm -rf $clients_directory/$client
  cd /root || exit
  mv "$client".* $clients_directory/$client
  cd $clients_directory || exit
  mkdir -p $client
  mv "$client".* "$client"
  zip -r "$client.zip" "$client"
  mv "$client.zip" "$client"
fi
