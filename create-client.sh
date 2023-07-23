#!/bin/bash
client=$1
mkdir -p $client
ikev2.sh --addclient $client
mv $client.* $client
zip -r $client.zip $client
cp $client.zip $client
mv $client ikeclients
