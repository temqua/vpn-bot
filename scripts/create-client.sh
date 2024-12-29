#!/bin/bash
client=$1
protocol=$2
if [[ $protocol == ikev2 ]]; then
	directory=$IKE_CONTAINER_DIR
	mkdir -p $client
	ikev2.sh --addclient $client
	mv $client.* $client
	mv $client $directory
	cd $directory
	zip -r $client.zip $client
	mv $client.zip $client
else
	directory=$WG_CONTAINER_DIR
	wireguard.sh --addclient $client
	mv $client.conf $directory
fi
