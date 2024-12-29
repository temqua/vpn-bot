#!/bin/bash
client=$1
protocol=$2
if [[ protocol == ikev2 ]]; then
    ikev2.sh --revokeclient $client
    ikev2.sh --deleteclient $client
else
    wireguard.sh -y --removeclient $client
fi
