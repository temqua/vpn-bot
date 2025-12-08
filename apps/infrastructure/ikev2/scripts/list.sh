#!/bin/bash
IKE_SH_PATH=""
clients_directory=""
if [[ "$LOCAL_DEBUG" == "true" ]]; then
  echo "Local debug enabled"
  IKE_SH_PATH="./"
  clients_directory="../debug/clients"
fi
echo "Command: ${IKE_SH_PATH}ikev2.sh --listclients"
CONFIG_DIR=$clients_directory ${IKE_SH_PATH}ikev2.sh --listclients