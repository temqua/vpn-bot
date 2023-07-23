#!/bin/bash
client=$1
cd ~
mkdir -p $client
touch $client.fake.sswan
touch $client.fake.mobileconfig
touch $client.fake.p12
mv $client.* $client
zip -r $client.zip $client
cp $client.zip $client
mv $client ikeclients
