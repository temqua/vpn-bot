#!/bin/bash
client=$1
mkdir -p $client
touch $client.fake.sswan
touch $client.fake.mobileconfig
touch $client.fake.p12
mv $client.* $client
zip -r $client.zip $client
cp $client.zip $client
