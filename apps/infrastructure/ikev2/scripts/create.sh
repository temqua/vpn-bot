#!/bin/bash
client=$1


IKE_SH_PATH=""
main_cert_directory=$IKE_CERT_DIR
directory="clients"
if [[ "$LOCAL_DEBUG" == "true" ]]; then
  echo "Local debug enabled"
  main_cert_directory="../debug"
  IKE_SH_PATH="./"
  mkdir -p $main_cert_directory
fi

echo "Creating IKEv2 client $client"
mkdir -p "$main_cert_directory/$directory"
mkdir -p "$main_cert_directory/$directory/$client"
echo "Command: ${IKE_SH_PATH}ikev2.sh --addclient $client"
CONFIG_DIR=$main_cert_directory ${IKE_SH_PATH}ikev2.sh --addclient "$client"
if [[ $? -eq 0 ]]; then
  cd $main_cert_directory || exit
  mv "$client".* "$directory/$client"
  cd "$directory" || exit
  zip -r "$client.zip" "$client"
  mv "$client.zip" "$client"
fi
