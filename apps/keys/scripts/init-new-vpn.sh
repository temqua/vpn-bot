#!/bin/bash
echo "Enter client name"
read client
echo "Choose protocol:"
echo "1) IKEv2"
echo "2) WireGuard"
read p
echo "Entered client: $client"
protocol=ikev2

if [[ p -eq 1 ]]; then
	protocol=ikev2
else
	protocol=wg
fi
echo "Chosen protocol: $protocol"
./create-client.sh $client $protocol
