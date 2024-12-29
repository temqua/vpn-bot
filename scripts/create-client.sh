#!/bin/bash
client=$1
protocol=$2
if [[ $protocol == ikev2 ]]; then
	directory=$IKE_CONTAINER_DIR
	mkdir -p $directory/$client
	ikev2.sh --addclient $client
	cd /root
	mv $client.* $directory/$client
	cd $directory
	zip -r $client.zip $client
	mv $client.zip $client
else
	directory=$WG_CONTAINER_DIR
	wireguard.sh --addclient $client
	cd /root
	mv $client.conf $directory
fi
