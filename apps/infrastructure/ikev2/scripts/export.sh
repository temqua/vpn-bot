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
echo "Command: ${IKE_SH_PATH}ikev2.sh --exportclient $client"
${IKE_SH_PATH}ikev2.sh --exportclient "$client"
if [[ $? -eq 0 ]]; then
  cd $main_cert_directory || exit
  rm -rf $directory/$client
  mkdir -p $directory/$client
  mv "$client".* "$directory/$client"
  cd "$directory" || exit
  zip -r "$client.zip" "$client"
  mv "$client.zip" "$client"
fi
