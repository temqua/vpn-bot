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
echo "Command ${IKE_SH_PATH}ikev2.sh -y --revokeclient $client"
echo "Command ${IKE_SH_PATH}ikev2.sh -y --deleteclient $client"
CONFIG_DIR=$clients_directory ${IKE_SH_PATH}ikev2.sh -y --revokeclient "$client"
CONFIG_DIR=$clients_directory ${IKE_SH_PATH}ikev2.sh -y --deleteclient "$client"
if [[ $? -eq 0 ]]; then
    echo "Remove command: rm -rf $clients_directory/$client" 
    rm -rf "$clients_directory/$client"  
    echo "Client '$client' successfully removed from IKEv2"
else
    echo "Error: failed to remove client '$client' from IKEv2"
    exit 1
fi
