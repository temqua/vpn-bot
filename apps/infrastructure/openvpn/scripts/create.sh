#!/bin/bash
client=$1
clients_directory=$OVPN_CLIENTS_DIR
mkdir -p $clients_directory

if [[ -z $client ]]; then
  echo "You should enter client"
  exit 1
fi

build_client_config() {
	cd /etc/openvpn/server/easy-rsa/ || exit 1
	(
		set -x
		./easyrsa --batch --days=3650 build-client-full "$client" nopass >/dev/null 2>&1
	)
}

new_client() {
	{
	cat /etc/openvpn/server/client-common.txt
	echo "<ca>"
	cat /etc/openvpn/server/easy-rsa/pki/ca.crt
	echo "</ca>"
	echo "<cert>"
	sed -ne '/BEGIN CERTIFICATE/,$ p' /etc/openvpn/server/easy-rsa/pki/issued/"$client".crt
	echo "</cert>"
	echo "<key>"
	cat /etc/openvpn/server/easy-rsa/pki/private/"$client".key
	echo "</key>"
	echo "<tls-crypt>"
	sed -ne '/BEGIN OpenVPN Static key/,$ p' /etc/openvpn/server/tc.key
	echo "</tls-crypt>"
	} > "$clients_directory/$client".ovpn
	chmod 600 "$clients_directory/$client".ovpn
}

build_client_config
new_client

if [[ $? -eq 0 ]]; then
  echo "$client added. Configuration available in "$clients_directory/$client".ovpn"
else
  echo "Error: failed to create client '$client' in OpenVPN"
fi
