#!/bin/bash
client=$1
protocol=$2
cd $HOST_TARGET
if [[ $protocol == ikev2 ]]; then
	directory=$IKE_HOME
	mkdir -p $IKE_HOME
	mkdir -p $client
	ikev2.sh --addclient $client
	mv $client.* $client
	mv $client $directory
	cd $directory
	zip -r $client.zip $client
	mv $client.zip $client
else
	directory=$WG_HOME
	mkdir -p $WG_HOME
	wireguard.sh --addclient $client
	mv $client.conf $directory
fi
