#!/bin/bash
WG_SH_PATH=""
if [[ "$LOCAL_DEBUG" == "true" ]]; then
  echo "Local debug enabled"
  WG_SH_PATH="./"
fi
echo "Command: ${WG_SH_PATH}wireguard.sh --listclients"
${WG_SH_PATH}wireguard.sh --listclients