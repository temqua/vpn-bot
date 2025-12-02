#!/bin/bash
client=$1
IKE_SH_PATH=""
main_cert_directory=$IKE_CERT_DIR
directory="clients"
if [[ "$LOCAL_DEBUG" == "true" ]]; then
  echo "Local debug enabled"
  main_cert_directory="../debug"
  IKE_SH_PATH="./"
fi

echo "Command ${IKE_SH_PATH}ikev2.sh -y --revokeclient $client"
echo "Command ${IKE_SH_PATH}ikev2.sh -y --deleteclient $client"
${IKE_SH_PATH}ikev2.sh -y --revokeclient "$client"
${IKE_SH_PATH}ikev2.sh -y --deleteclient "$client"
if [[ $? -eq 0 ]]; then
    echo "Remove command: rm -rf $main_cert_directory/$directory/$client" 
    rm -rf "$main_cert_directory/$directory/$client"  
    echo "Client '$client' successfully removed from IKEv2"
else
    echo "Error: failed to remove client '$client' from IKEv2"
    exit 1
fi
