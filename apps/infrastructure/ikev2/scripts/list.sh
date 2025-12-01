#!/bin/bash
IKE_SH_PATH=""
if [[ "$LOCAL_DEBUG" == "true" ]]; then
  echo "Local debug enabled"
  IKE_SH_PATH="./"
fi
echo "Command: ${IKE_SH_PATH}ikev2.sh --listclients"
${IKE_SH_PATH}ikev2.sh --listclients