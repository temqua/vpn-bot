#!/bin/bash
client=$1
protocol=$2
cd ~
if [[ $protocol == ikev2 ]]; then
	directory=ikev2-clients
	mkdir -p $client
	sudo ikev2.sh --addclient $client
	mv $client.* $client
	mv $client $directory
	cd $directory
	zip -r $client.zip $client
	mv $client.zip $client
else
	directory=wg-clients
	bash wireguard.sh --addclient $client
	mv $client.conf $directory
fi
echo $directory
